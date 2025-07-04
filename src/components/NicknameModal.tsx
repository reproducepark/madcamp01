import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  Alert, // Make sure Alert is imported
} from 'react-native';

interface NicknameModalProps {
  isVisible: boolean; // Controls modal visibility
  onClose: () => void; // Function to call when modal close is requested
  onSubmit: (nickname: string) => void; // Function to call when nickname is submitted
}

const NicknameModal: React.FC<NicknameModalProps> = ({ isVisible, onClose, onSubmit }) => {
  const [nickname, setNickname] = useState(''); // State for nickname input

  // Handles the submission of the nickname
  const handleSubmit = () => {
    if (nickname.trim().length > 0) {
      onSubmit(nickname.trim()); // Submit trimmed nickname
      setNickname(''); // Clear input field after submission
    } else {
      // Use Alert for user feedback if nickname is empty
      Alert.alert('알림', '닉네임을 입력해주세요.');
    }
  };

  // Handles the cancellation of the nickname input
  const handleCancel = () => {
    setNickname(''); // Clear input on cancel
    onClose(); // Close the modal
  };

  return (
    <Modal
      animationType="slide" // Slide animation for a full-screen feel
      transparent={false} // Modal is not transparent
      visible={isVisible} // Controls the current visibility of the modal
      onRequestClose={handleCancel} // Callback for when the user requests to close the modal (e.g., Android back button)
    >
      <SafeAreaView style={styles.fullScreenModalContainer}>
        {/* Header Section: Contains Cancel, Title, and Done buttons */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>닉네임 설정</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.headerButton}
            disabled={nickname.trim().length === 0} // Disable '완료' button if nickname is empty
          >
            <Text
              style={[
                styles.headerButtonText,
                nickname.trim().length === 0 && styles.disabledButtonText, // Apply disabled style
              ]}
            >
              완료
            </Text>
          </TouchableOpacity>
        </View>

        {/* Body Section for Input */}
        <View style={styles.modalBody}>
          <Text style={styles.inputDescription}>
            앱에서 사용할 닉네임을 입력해주세요.
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="닉네임을 입력하세요"
            placeholderTextColor="#999"
            value={nickname}
            onChangeText={setNickname}
            maxLength={15} // Limit nickname length
            autoCapitalize="none" // Disable auto-capitalization
            autoCorrect={false} // Disable auto-correction
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: 'white', // Full screen background
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Adjust for Android status bar
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f8f8',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 5,
  },
  headerButtonText: {
    fontSize: 18,
    color: '#f4511e', // Action button color
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#ccc', // Lighter color for disabled button text
  },
  modalBody: {
    flex: 1, // Takes up available space
    padding: 15,
  },
  inputDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'left',
    width: '100%',
  },
  textInput: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
});

export default NicknameModal;
