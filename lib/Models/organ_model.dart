class OrganModel {
  final String id;
  final String organName;
  final String department;
  final String email;
  final String password;
  final String name;

  OrganModel({
    required this.id,
    required this.organName,
    required this.department,
    required this.email,
    required this.password,
    required this.name,
  });

  factory OrganModel.fromMap(Map<String, dynamic> data, String documentId) {
    return OrganModel(
      id: documentId,
      organName: data['organName'] ?? '',
      department: data['department'] ?? '',
      email: data['email'] ?? '',
      password: data['password'] ?? '',
      name: data['name'] ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'organName': organName,
      'department': department,
      'email': email,
      'password': password,
      'name': name,
    };
  }

  OrganModel copyWith({
    String? id,
    String? organName,
    String? department,
    String? email,
    String? password,
    String? name,
  }) {
    return OrganModel(
      id: id ?? this.id,
      organName: organName ?? this.organName,
      department: department ?? this.department,
      email: email ?? this.email,
      password: password ?? this.password,
      name: name ?? this.name,
    );
  }
}









