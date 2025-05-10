import 'package:flutter/foundation.dart'; // for kIsWeb
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:html' as html; // Only for web storage

class SecureStorageService {
  final _secureStorage = kIsWeb ? null : FlutterSecureStorage();

  Future<void> saveData(String key, String value) async {
    if (kIsWeb) {
      html.window.localStorage[key] = value;
    } else {
      await _secureStorage?.write(key: key, value: value);
    }
  }

  Future<String?> readData(String key) async {
    if (kIsWeb) {
      return html.window.localStorage[key];
    } else {
      return await _secureStorage?.read(key: key);
    }
  }

  Future<void> deleteData(String key) async {
    if (kIsWeb) {
      html.window.localStorage.remove(key);
    } else {
      await _secureStorage?.delete(key: key);
    }
  }
}
