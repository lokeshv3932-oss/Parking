package com.symmesfleet.backend.config;

import com.symmesfleet.backend.domain.AdminUser;
import com.symmesfleet.backend.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_BOOTSTRAP_USERNAME:}")
    private String bootstrapUsername;

    @Value("${ADMIN_BOOTSTRAP_PASSWORD:}")
    private String bootstrapPassword;

    public AdminBootstrap(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (bootstrapUsername.isBlank() || bootstrapPassword.isBlank()) {
            return;
        }
        if (adminUserRepository.findByUsername(bootstrapUsername).isPresent()) {
            return;
        }
        AdminUser user = new AdminUser();
        user.setUsername(bootstrapUsername);
        user.setPasswordHash(passwordEncoder.encode(bootstrapPassword));
        user.setRole("ROLE_ADMIN");
        adminUserRepository.save(user);
        log.info("Bootstrapped admin user '{}'", bootstrapUsername);
    }
}
