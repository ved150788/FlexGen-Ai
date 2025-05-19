"""
Tests for payload generation functionality
"""

import unittest
from ..utils import generate_fuzzed_value, get_attack_string

class TestPayloadGeneration(unittest.TestCase):
    """Test payload generation functionality"""
    
    def test_string_generation(self):
        """Test string value generation"""
        # Test basic string generation
        string_val = generate_fuzzed_value("string")
        self.assertIsInstance(string_val, str)
        
        # Test with specific format
        email = generate_fuzzed_value("string", format_type="email")
        self.assertIsInstance(email, str)
        self.assertIn("@", email)
        
        # Test with enum values
        enum_values = ["red", "green", "blue"]
        for _ in range(10):  # Try multiple times to ensure we get expected behavior
            enum_val = generate_fuzzed_value("string", enum_values=enum_values, include_attacks=False)
            if "_INVALID_ENUM" not in enum_val:
                self.assertIn(enum_val, enum_values)
    
    def test_number_generation(self):
        """Test number value generation"""
        # Test basic number generation
        num_val = generate_fuzzed_value("number")
        self.assertIsInstance(num_val, (int, float))
        
        # Test with min and max values
        bounded_val = generate_fuzzed_value("number", min_val=10, max_val=20)
        self.assertIsInstance(bounded_val, (int, float))
        
        # Not guaranteed to be within bounds due to fuzzing nature
        # But most values should be within bounds
        attempts = [generate_fuzzed_value("number", min_val=10, max_val=20) for _ in range(20)]
        within_bounds = [10 <= val <= 20 for val in attempts if isinstance(val, (int, float))]
        self.assertGreater(sum(within_bounds), 10)  # At least half should be in bounds
    
    def test_boolean_generation(self):
        """Test boolean value generation"""
        bool_val = generate_fuzzed_value("boolean")
        self.assertIsInstance(bool_val, bool)
    
    def test_array_generation(self):
        """Test array value generation"""
        array_val = generate_fuzzed_value("array")
        self.assertIsInstance(array_val, list)
    
    def test_object_generation(self):
        """Test object value generation"""
        object_val = generate_fuzzed_value("object")
        self.assertIsInstance(object_val, dict)
    
    def test_attack_strings(self):
        """Test attack string generation"""
        # Test getting any attack string
        attack = get_attack_string()
        self.assertIsInstance(attack, str)
        
        # Test getting specific attack types
        sql_attack = get_attack_string("sql_injection")
        self.assertIsInstance(sql_attack, str)
        
        xss_attack = get_attack_string("xss")
        self.assertIsInstance(xss_attack, str)
        
        # Test including attacks in generated values
        # We can't guarantee an attack will be chosen due to randomness,
        # but we can check that the function runs without errors
        for _ in range(10):
            val = generate_fuzzed_value("string", include_attacks=True)
            self.assertIsInstance(val, str)
    
    def test_special_formats(self):
        """Test special format value generation"""
        # Test date format
        date_val = generate_fuzzed_value("string", format_type="date")
        self.assertIsInstance(date_val, str)
        
        # Test URL format
        url_val = generate_fuzzed_value("string", format_type="uri")
        self.assertIsInstance(url_val, str)
        self.assertTrue(url_val.startswith("https://"))

if __name__ == "__main__":
    unittest.main() 