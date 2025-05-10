import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../Models/Company_user.dart';
import '../Models/bid_organ_model.dart';

class CompanyProvider with ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  BidOrganModel? _currentBidOrganModel;
  CompanyUser? _currentCompanyUser;
  List<BidOrganModel> tenders = [];

  CompanyProvider() {
    _auth.authStateChanges().listen((user) {
      if (user != null) {
        getCompanyUser(user.uid);
      } else {
        _currentCompanyUser = null;
        notifyListeners();
      }
    });
  }

  BidOrganModel? get currentBidOrganModel => _currentBidOrganModel;
  CompanyUser? get currentCompanyUser => _currentCompanyUser;

  Future<bool> deleteCompanyUser(String companyId) async {
    try {
      // Deleting the company user from Firestore
      await FirebaseFirestore.instance.collection('companies').doc(companyId).delete();
      return true;
    } catch (e) {
      print("Error deleting company user: $e");
      return false;
    }
  }

  Future<void> saveCompanyUser(CompanyUser company) async {
    try {
      final user = _auth.currentUser;
      if (user == null) throw Exception("No authenticated user.");

      await _firestore.collection('company_users').doc(user.uid).set(company.toJson());
      _currentCompanyUser = company;
      notifyListeners();
    } catch (e) {
      debugPrint("❌ Error saving company user: $e");
      rethrow;
    }
  }

  /// Fetch company user data by UID
  Future<CompanyUser?> getCompanyUser(String uid) async {
    try {
      final docSnapshot = await _firestore.collection('company_users').doc(uid).get();
      if (docSnapshot.exists) {
        _currentCompanyUser = CompanyUser.fromJson(docSnapshot.data()!);
        notifyListeners();
        return _currentCompanyUser;
      } else {
        debugPrint("⚠️ No company user found for UID: $uid");
        return null;
      }
    } catch (e) {
      debugPrint("❌ Error fetching company user: $e");
      return null;
    }
  }

  /// 🔁 Update company profile using full CompanyUser object
  Future<bool> updateCompanyUser(CompanyUser updatedCompany) async {
    try {
      await _firestore
          .collection('company_users')
          .doc(updatedCompany.id)
          .update(updatedCompany.toJson());

      _currentCompanyUser = updatedCompany;
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('❌ Error updating company: $e');
      return false;
    }
  }

  /// Fetch tenders created by the current company
  Future<void> fetchTenders() async {
    try {
      final user = _auth.currentUser;
      if (user == null) throw Exception("No authenticated user.");

      final snapshot = await _firestore
          .collection('tenders')
          .where('companyId', isEqualTo: user.uid)
          .get();

      tenders = snapshot.docs.map((doc) => BidOrganModel.fromFirestore(doc)).toList();
      notifyListeners();
    } catch (e) {
      debugPrint("❌ Error fetching tenders: $e");
    }
  }

  /// Login existing company user
  Future<String?> loginCompany({
    required String email,
    required String password,
  }) async {
    try {
      UserCredential credential = await _auth.signInWithEmailAndPassword(
          email: email, password: password);
      await getCompanyUser(credential.user!.uid);
      return null;
    } on FirebaseAuthException catch (e) {
      return _getFirebaseAuthError(e);
    } catch (e) {
      debugPrint("❌ Error: $e");
      return "Something went wrong. Please try again.";
    }
  }

  /// Register new company user
  Future<UserCredential?> registerCompany({
    required String email,
    required String password,
    required String companyName,
    required String registrationNumber,
  }) async {
    try {
      UserCredential userCredential = await _auth.createUserWithEmailAndPassword(
          email: email, password: password);

      final uid = userCredential.user!.uid;
      final newUser = CompanyUser(
        id: uid,
        email: email,
        companyName: companyName,
        registrationNumber: registrationNumber,
        location: '',
        industry: '',
        about: '',
      );
      await _firestore.collection('company_users').doc(uid).set(newUser.toJson());

      await getCompanyUser(uid);
      return userCredential;
    } catch (e) {
      debugPrint("❌ Error during registration: $e");
      return null;
    }
  }

  /// Logout current company user
  Future<void> logout() async {
    await _auth.signOut();
    _currentCompanyUser = null;
    _currentBidOrganModel = null;
    notifyListeners();
  }

  /// Send password reset email
  Future<void> sendPasswordResetEmail(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
      debugPrint("✅ Password reset email sent to $email");
    } catch (e) {
      debugPrint("❌ Error sending reset email: $e");
    }
  }

  /// Handle FirebaseAuth exceptions
  String _getFirebaseAuthError(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return "No user found for this email.";
      case 'wrong-password':
        return "Incorrect password.";
      case 'invalid-email':
        return "Invalid email format.";
      case 'too-many-requests':
        return "Too many requests. Please try again later.";
      default:
        return "Authentication error: ${e.message}";
    }
  }
}















