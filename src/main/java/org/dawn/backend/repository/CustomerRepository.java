package org.dawn.backend.repository;

import org.dawn.backend.entity.Customer;
import org.dawn.backend.repository.base.BaseRepository;

import javax.swing.text.html.Option;
import java.util.Optional;

public interface CustomerRepository extends BaseRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByPhoneNumber(String phoneNumber);
}
