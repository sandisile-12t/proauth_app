import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../Models/organ_model.dart';

class OrganProvider with ChangeNotifier {
  final List<OrganModel> _organs = [];
  OrganModel? currentOrgan;

  List<OrganModel> get organs => _organs;
  OrganModel? get currentOrganUser => currentOrgan;

  // ✅ REGISTER with Firebase Authentication + Firestore
  Future<void> registerOrgan({
    required String organName,
    required String department,
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      // Register user in Firebase Authentication
      UserCredential authResult = await FirebaseAuth.instance
          .createUserWithEmailAndPassword(email: email, password: password);

      // Save additional info in Firestore
      final docRef = FirebaseFirestore.instance.collection('organs').doc(authResult.user!.uid);

      await docRef.set({
        'organName': organName,
        'department': department,
        'email': email,
        'name': name,
        'role': 'Admin',
      });

      final newOrgan = OrganModel(
        id: docRef.id,
        organName: organName,
        department: department,
        email: email,
        password: password, // Only temporarily used here
        name: name,
      );

      _organs.add(newOrgan);
      currentOrgan = newOrgan;
      notifyListeners();
    } catch (e) {
      debugPrint("Error registering organ: $e");
      rethrow;
    }
  }

  // ✅ LOGIN method
  Future<void> loginOrgan(String email, String password, BuildContext context) async {
    try {
      final authResult = await FirebaseAuth.instance
          .signInWithEmailAndPassword(email: email, password: password);

      final uid = authResult.user?.uid;
      if (uid == null) {
        throw Exception("Authentication failed: No UID found.");
      }

      final docSnapshot =
      await FirebaseFirestore.instance.collection('organs').doc(uid).get();

      if (!docSnapshot.exists || docSnapshot.data() == null) {
        throw Exception("Organ profile not found in Firestore.");
      }

      final data = docSnapshot.data()!;
      final organ = OrganModel(
        id: uid,
        organName: data['organName'] ?? '',
        department: data['department'] ?? '',
        email: data['email'] ?? '',
        name: data['name'] ?? '',
        password: '',
      );

      // Storing current organ in state (if needed)
      currentOrgan = organ;
      notifyListeners();

      // Navigating to OrganProfilePage and passing the OrganModel and role
      Navigator.pushReplacementNamed(
        context,
        '/organProfile',
        arguments: organ, // Passing the organ data as an argument
      );

      print("Organ login successful: ${organ.organName}");

    } on FirebaseAuthException catch (e) {
      debugPrint("FirebaseAuth error: ${e.code} - ${e.message}");
      rethrow;
    } catch (e) {
      debugPrint("Login error: $e");
      rethrow;
    }
  }


  Future<OrganModel?> getOrganUser(String uid) async {
    final doc = await FirebaseFirestore.instance.collection('organs').doc(uid).get();
    if (doc.exists) {
      // Pass the document ID and the document data to fromMap
      currentOrgan = OrganModel.fromMap(doc.data()!, doc.id);
      notifyListeners();
      return currentOrgan;
    }
    return null;
  }

  void login(OrganModel organ) {
    currentOrgan = organ;
    notifyListeners();
  }
  // ✅ Set current user (useful after login to set user state)
  void setOrganUser(OrganModel organ) {
    currentOrgan = organ;
    notifyListeners();
  }

  void logout() {
    FirebaseAuth.instance.signOut();
    currentOrgan = null;
    notifyListeners();
  }
}










