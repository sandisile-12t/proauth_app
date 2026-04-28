import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';

interface CustomTextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e53935',
  },
  errorText: {
    fontSize: 12,
    color: '#e53935',
    marginTop: 4,
  },
});

export default CustomTextField;