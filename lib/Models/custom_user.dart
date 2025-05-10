import 'package:cloud_firestore/cloud_firestore.dart'; // Firebase Firestore
import 'package:firebase_auth/firebase_auth.dart'; // Firebase Authentication

class CustomUser {
  final String id;
  final String name;
  final String email;
  final bool profileComplete;
  final String? profilePictureUrl;

  CustomUser({
    required this.id,
    required this.name,
    required this.email,
    this.profileComplete = false,
    this.profilePictureUrl,
  });

  /// Factory constructor to create a `CustomUser` instance from Firestore data.
  factory CustomUser.fromJson(Map<String, dynamic> json) {
    return CustomUser(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      profileComplete: json['profileComplete'] as bool? ?? false,
      profilePictureUrl: json['profilePictureUrl'] as String?,
    );
  }

  /// Convert `CustomUser` instance to a map for Firestore storage.
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'profileComplete': profileComplete,
      'profilePictureUrl': profilePictureUrl,
    };
  }

  /// Allows updating selected user fields.
  CustomUser copyWith({
    String? id,
    String? name,
    String? email,
    bool? profileComplete,
    String? profilePictureUrl,
  }) {
    return CustomUser(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      profileComplete: profileComplete ?? this.profileComplete,
      profilePictureUrl: profilePictureUrl ?? this.profilePictureUrl,
    );
  }

  /// Fetches the user profile from Firestore.
  static Future<CustomUser?> loadProfile() async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        throw Exception("User is not logged in");
      }

      final doc = await FirebaseFirestore.instance.collection('users').doc(user.uid).get();

      if (doc.exists && doc.data() != null) {
        return CustomUser.fromJson(doc.data()!);
      } else {
        throw Exception("User profile not found in Firestore");
      }
    } catch (e, stackTrace) {
      print("Error loading user profile: $e\n$stackTrace");
      return null;  // Returning null if error occurs
    }
  }

  /// Saves or updates user profile data in Firestore.
  Future<void> saveToFirestore() async {
    try {
      await FirebaseFirestore.instance.collection('users').doc(id).set(
        toMap(),
        SetOptions(merge: true), // Prevents overwriting existing data
      );
    } catch (e) {
      throw Exception("Error saving user profile: $e");
    }
  }
}