import 'package:flutter/material.dart';


class UserRoles {
  static const String individual = 'Individual';
  static const String company = 'Company';
}

class AuthProvider with ChangeNotifier {
  bool _isAuthenticated = false;
  String _userName = '';
  String _userRole = '';
  bool _isLoading = false;

  // Constants for error messages
  static const String emptyFieldsError = 'Please fill in all fields.';
  static const String invalidLoginError = 'Invalid email or password.';
  static const String unexpectedError = 'An unexpected error occurred: ';

  // Getter for authenticated state
  bool get isAuthenticated => _isAuthenticated;

  // Getter for loading state
  bool get isLoading => _isLoading;

  // Getters for user details
  String get userName => _userName;
  String get userRole => _userRole;

  // Private method to update loading state
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Login method
  Future<String?> login(String email, String password, String role) async {
    _setLoading(true);

    try {
      await Future.delayed(const Duration(seconds: 2));

      if (email.isEmpty || password.isEmpty) {
        _setLoading(false);
        return emptyFieldsError;
      }

      // Simulate login success
      bool loginSuccessful = email.isNotEmpty && password.isNotEmpty;

      if (loginSuccessful) {
        _isAuthenticated = true;
        _userName = email;
        _userRole = role;
        _setLoading(false);
        return null;
      } else {
        _setLoading(false);
        return invalidLoginError;
      }
    } catch (error) {
      _setLoading(false);
      return unexpectedError + error.toString();
    }
  }

  // Sign up method
  Future<String?> signUp(String userName, String email, String password, String role) async {
    _setLoading(true);

    try {
      await Future.delayed(const Duration(seconds: 2));

      if (userName.isEmpty || email.isEmpty || password.isEmpty) {
        _setLoading(false);
        return emptyFieldsError;
      }

      // Simulate success
      bool signUpSuccessful = true;

      if (signUpSuccessful) {
        _userName = userName;
        _userRole = role;
        _setLoading(false);
        return null;
      } else {
        _setLoading(false);
        return 'Failed to sign up. Please try again.';
      }
    } catch (error) {
      _setLoading(false);
      return unexpectedError + error.toString();
    }
  }

  // Logout method
  void logout() {
    _isAuthenticated = false;
    _userName = '';
    _userRole = '';
    notifyListeners();
  }
}















