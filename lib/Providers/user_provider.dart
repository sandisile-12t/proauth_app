import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../Models/custom_user.dart'; // Ensure correct path

class UserProvider with ChangeNotifier {
  CustomUser? _currentUser;

  /// Setter for manually updating user (e.g., post-signup)
  void setUser(CustomUser user) {
    _currentUser = user;
    notifyListeners();
  }

  /// Getter for current authenticated user
  CustomUser? get currentUser => _currentUser;

  UserProvider() {
    // Listen to Firebase Auth state changes
    FirebaseAuth.instance.authStateChanges().listen((firebaseUser) {
      if (firebaseUser != null) {
        _loadUserProfile(firebaseUser.uid);
      } else {
        _currentUser = null;
        notifyListeners();
      }
    });
  }

  /// Fetches and sets user profile for given UID
  Future<void> getUser(String uid) async {
    await _loadUserProfile(uid);
  }

  /// Sign in individual user and load profile
  Future<CustomUser?> loginIndividual({
    required String email,
    required String password,
  }) async {
    try {
      final cred = await FirebaseAuth.instance
          .signInWithEmailAndPassword(email: email, password: password);
      final uid = cred.user?.uid;
      if (uid == null) throw Exception('Authenticated UID is null');
      return await _loadUserProfile(uid);
    } catch (e) {
      debugPrint('Login failed: $e');
      rethrow;
    }
  }

  /// Internal: loads user profile from Firestore (users, company_users, organs)
  Future<CustomUser?> _loadUserProfile(String uid) async {
    try {
      final collections = ['users', 'company_users', 'organs'];
      for (var col in collections) {
        final doc = await FirebaseFirestore.instance.collection(col).doc(uid).get();
        if (doc.exists && doc.data() != null) {
          final data = doc.data()!..['id'] = doc.id;
          _currentUser = CustomUser.fromJson(data);
          notifyListeners();
          debugPrint('Loaded user from $col (UID=$uid)');
          return _currentUser;
        }
      }
      debugPrint('No profile found for UID=$uid');
    } catch (e) {
      debugPrint('Error loading profile: $e');
    }
    return null;
  }

  /// Sign out
  Future<void> signOut() async {
    await FirebaseAuth.instance.signOut();
    _currentUser = null;
    notifyListeners();
  }
}






