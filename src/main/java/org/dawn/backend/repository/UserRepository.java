package org.dawn.backend.repository;

import org.dawn.backend.constant.URole;
import org.dawn.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Page<User> findAll(Pageable pageable);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);


    @Query("""
                SELECT CASE
                    WHEN COUNT(u) > 0
                    THEN true ELSE false END
                FROM User AS u JOIN u.role AS r
                WHERE r.name = :rolename
            """)
    boolean existsByRoleName(@Param("rolename") URole roleName);


    @Query("""
                SELECT CASE
                    WHEN COUNT(u) > 0
                    THEN true ELSE false END
                FROM User AS u JOIN u.role AS r
                WHERE u.username = :username
            """)
    boolean existsByUserName(@Param("username") String username);
}

