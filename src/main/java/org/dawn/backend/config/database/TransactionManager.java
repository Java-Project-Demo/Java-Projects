package org.dawn.backend.config.database;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.function.Supplier;

@RequiredArgsConstructor
@Slf4j
public class TransactionManager {
    private final DataSource dataSource;

    public <T> T execute(Supplier<T> action) {
        if (TransactionContext.get() != null) {
            return action.get();
        }

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            TransactionContext.set(conn);
            try {
                T result = action.get();

                conn.commit();
                return result;

            } catch (Exception e) {
                conn.rollback();
                throw e;
            } finally {
                TransactionContext.remove();
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
