package com.symmesfleet.backend.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.RefundCreateParams;
import com.symmesfleet.backend.domain.Booking;
import com.symmesfleet.backend.domain.BookingStatus;
import com.symmesfleet.backend.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class StripeWebhookService {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookService.class);

    private final BookingRepository bookingRepository;

    public StripeWebhookService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public void handlePaymentSucceeded(String paymentIntentId) {
        int rowsUpdated = bookingRepository.confirmIfPending(paymentIntentId);
        if (rowsUpdated > 0) {
            return;
        }
        // Guarded UPDATE affected no rows - either this is a duplicate delivery of an
        // already-CONFIRMED booking (fine, no-op) or the hold expired/cancelled before
        // payment cleared (money captured for a spot we no longer guarantee - refund + flag).
        Booking booking = bookingRepository.findByStripePaymentIntentId(paymentIntentId).orElse(null);
        if (booking == null) {
            log.warn("Stripe webhook: no booking found for payment intent {}", paymentIntentId);
            return;
        }
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return;
        }
        refundAndFlag(paymentIntentId);
    }

    public void handlePaymentFailed(String paymentIntentId) {
        bookingRepository.cancelIfPendingByPaymentIntent(paymentIntentId);
    }

    private void refundAndFlag(String paymentIntentId) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            String chargeId = intent.getLatestCharge();
            if (chargeId != null) {
                RefundCreateParams params = RefundCreateParams.builder()
                        .setPaymentIntent(paymentIntentId)
                        .build();
                Refund.create(params);
            }
            log.error("ACTION REQUIRED: payment {} succeeded after its booking hold expired (or was already confirmed). "
                    + "Auto-refunded if a charge existed; customer may need to rebook.", paymentIntentId);
        } catch (StripeException e) {
            log.error("Failed to auto-refund payment intent {} - manual refund required.", paymentIntentId, e);
        }
    }
}
