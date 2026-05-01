package com.stayiq.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.CallableStatementCreator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Types;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DatabaseController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 1. Raw JDBC query for fetching all bookings
    @GetMapping("/bookings")
    public ResponseEntity<?> getBookings() {
        try {
            String sql = "SELECT id, guest_name, hotel, adr, check_in_date, status FROM bookings ORDER BY id DESC";
            List<Map<String, Object>> bookings = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok().body(Map.of("bookings", bookings));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // 2. Raw JDBC query for fetching audit logs (proving the trigger fired)
    @GetMapping("/audit")
    public ResponseEntity<?> getAuditLogs(@RequestParam(defaultValue = "10") int limit) {
        try {
            String sql = "SELECT a.audit_id, a.booking_id, a.old_status, a.new_status, a.action, a.changed_at, b.guest_name " +
                         "FROM booking_audit a " +
                         "JOIN bookings b ON a.booking_id = b.id " +
                         "ORDER BY a.changed_at DESC LIMIT ?";
            List<Map<String, Object>> logs = jdbcTemplate.queryForList(sql, limit);
            return ResponseEntity.ok().body(Map.of("audit_logs", logs));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // 3. Raw JDBC CallableStatement to execute the Stored Procedure
    @PutMapping("/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable int id) {
        try {
            String procSql = "{call cancel_booking_sp(?)}";
            
            jdbcTemplate.execute(
                new CallableStatementCreator() {
                    @Override
                    public CallableStatement createCallableStatement(Connection con) throws SQLException {
                        CallableStatement cs = con.prepareCall(procSql);
                        cs.setInt(1, id);
                        return cs;
                    }
                },
                new CallableStatementCallback<Object>() {
                    @Override
                    public Object doInCallableStatement(CallableStatement cs) throws SQLException {
                        cs.execute();
                        return null;
                    }
                }
            );
            
            return ResponseEntity.ok().body(Map.of("message", "Booking canceled successfully via stored procedure"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to cancel booking: " + e.getMessage()));
        }
    }
}
