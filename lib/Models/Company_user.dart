class CompanyUser {
  String id;
  String companyName;
  String email;
  String location;
  String industry;
  String? about;
  String registrationNumber;

  CompanyUser({
    required this.id,
    required this.companyName,
    required this.email,
    required this.location,
    required this.industry,
    required this.about,
    required this.registrationNumber,
  });

  factory CompanyUser.fromJson(Map<String, dynamic> json) {
    if (json['id'] == null || json['registrationNumber'] == null) {
      throw ArgumentError("id and registrationNumber cannot be null.");
    }

    return CompanyUser(
      id: json['id'],
      companyName: json['companyName'] ?? 'Unknown',
      email: json['email'] ?? 'Unknown',
      location: json['location'] ?? '',
      industry: json['industry'] ?? 'Unknown',
      about: json['about'] ?? '',
      registrationNumber: json['registrationNumber'],
    );
  }

  Map<String, dynamic> toJson() {
    if (id.isEmpty || registrationNumber.isEmpty) {
      throw ArgumentError("id and registrationNumber cannot be empty.");
    }

    if (companyName.isEmpty || email.isEmpty) {
      throw ArgumentError("Fields 'companyName' and 'email' cannot be empty.");
    }

    return {
      'id': id,
      'companyName': companyName,
      'email': email,
      'location': location,
      'industry': industry,
      'about': about,
      'registrationNumber': registrationNumber,
    };
  }

  CompanyUser copyWith({
    String? id,
    String? companyName,
    String? email,
    String? location,
    String? industry,
    String? about,
    String? registrationNumber,
  }) {
    return CompanyUser(
      id: id ?? this.id,
      companyName: companyName ?? this.companyName,
      email: email ?? this.email,
      location: location ?? this.location,
      industry: industry ?? this.industry,
      about: about ?? this.about,
      registrationNumber: registrationNumber ?? this.registrationNumber,
    );
  }

  @override
  String toString() {
    return 'CompanyUser(id: $id, companyName: $companyName, email: $email, location: $location, industry: $industry, about: $about, registrationNumber: $registrationNumber)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other is CompanyUser &&
            other.id == id &&
            other.companyName == companyName &&
            other.email == email &&
            other.location == location &&
            other.industry == industry &&
            other.about == about &&
            other.registrationNumber == registrationNumber);
  }

  @override
  int get hashCode => Object.hash(id, companyName, email, location, industry, about, registrationNumber);
}


