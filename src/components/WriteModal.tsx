// components/WriteModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // ImagePicker 임포트

interface WriteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
}

export function WriteModal({ visible, onClose, onSave }: WriteModalProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleSave = () => {
    if (newTitle.trim() === '' || newDescription.trim() === '') {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }
    onSave(newTitle, newDescription);
    setNewTitle('');
    setNewDescription('');
  };

  const handleCancel = () => {
    setNewTitle('');
    setNewDescription('');
    onClose();
  };

  const handleAttachPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert(
        '권한 필요',
        '사진을 선택하려면 미디어 라이브러리 접근 권한이 필요합니다.'
        );
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        // ✅ Use ImagePicker.MediaType instead of MediaTypeOptions
        mediaTypes: ['images'],
        quality: 1,
    });

    if (!result.canceled) {
        const pickedImageUri = result.assets[0].uri;
        console.log('선택된 이미지 URI:', pickedImageUri);
        Alert.alert('사진 첨부', `사진이 선택되었습니다: ${pickedImageUri.substring(0, 30)}...`);
    } else {
        Alert.alert('알림', '사진 선택이 취소되었습니다.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.fullScreenModalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>X</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>완료</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          <TextInput
            style={styles.inputTitle}
            placeholder="제목을 입력하세요"
            value={newTitle}
            onChangeText={setNewTitle}
            maxLength={50}
          />
          <TextInput
            style={styles.inputDescription}
            placeholder="내용을 입력하세요"
            value={newDescription}
            onChangeText={setNewDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity onPress={handleAttachPhoto} style={styles.attachPhotoButton}>
            <Text style={styles.attachPhotoButtonText}>사진 첨부</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
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
    color: '#f4511e',
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
    padding: 15,
  },
  inputTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  inputDescription: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f8f8f8',
  },
  attachPhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  attachPhotoButtonText: {
    fontSize: 14,
    color: '#333',
  },
});