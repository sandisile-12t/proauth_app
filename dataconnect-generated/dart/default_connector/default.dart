library default_connector;

import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class DefaultConnector {
  static final DefaultConnector _instance = DefaultConnector._internal();

  late FirebaseApp _firebaseApp;
  late FirebaseFirestore _firestore;

  factory DefaultConnector() {
    return _instance;
  }

  DefaultConnector._internal();

  /// Call this once at app startup
  Future<void> initialize() async {
    _firebaseApp = await Firebase.initializeApp();
    _firestore = FirebaseFirestore.instanceFor(app: _firebaseApp);
  }

  /// Use this to access Firestore instance
  FirebaseFirestore get firestore => _firestore;
}


