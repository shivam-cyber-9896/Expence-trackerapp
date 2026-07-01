package com.shivam.monocept.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // 512-bit signing key for security
    private final String jwtSecret = "jwtSecretKeyMustBeVeryLongToMeetSigningRequirementsMinimum64BytesLongString1234567890";
    private final long jwtExpirationDate = 604800000; // 7 days in milliseconds

    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(String email, String role, Long employeeId) {
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationDate);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("employeeId", employeeId)
                .setIssuedAt(currentDate)
                .setExpiration(expireDate)
                .signWith(key(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getEmail(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
