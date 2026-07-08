package com.symmesfleet.backend.repository;

import com.symmesfleet.backend.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByVerificationToken(String verificationToken);
}
