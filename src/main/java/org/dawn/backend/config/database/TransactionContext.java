package org.dawn.backend.config.database;

import java.sql.Connection;

public class TransactionContext {
    private static final ThreadLocal<Connection> connectionThreadLocal = new ThreadLocal<>();

    public static Connection get() {
        return connectionThreadLocal.get();
    }

    public static void set(Connection connection) {
        connectionThreadLocal.set(connection);
    }

    public static void remove() {
        connectionThreadLocal.remove();
    }
}
