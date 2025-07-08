// components/WriteModal.tsx

import React, { useState, useEffect } from 'react'; // useEffect 임포트
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
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

interface WriteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, imageUri?: string) => void;
  // ✨ 초기값을 받을 수 있도록 props 추가
  initialTitle?: string;
  initialDescription?: string;
  initialImageUri?: string;
}

export function WriteModal({ visible, onClose, onSave, initialTitle, initialDescription, initialImageUri }: WriteModalProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [imageUri, setImageUri] = useState<string|undefined>(undefined);

  // ✨ visible이 true가 될 때마다 초기값으로 상태를 설정
  useEffect(() => {
    if (visible) {
      setNewTitle(initialTitle || '');
      setNewDescription(initialDescription || '');
      setImageUri(initialImageUri || undefined);
    }
  }, [visible, initialTitle, initialDescription, initialImageUri]);

  const handleSave = () => {
    if (newTitle.trim() === '' || newDescription.trim() === '') {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }
    onSave(newTitle, newDescription, imageUri);
    // 모달을 닫을 때 상태를 초기화하지 않음. onClose가 알아서 처리
    // setNewTitle(''); // 이제 여기서는 초기화하지 않습니다.
    // setNewDescription(''); // 이제 여기서는 초기화하지 않습니다.
    // setImageUri(undefined); // 이제 여기서는 초기화하지 않습니다.
  };

  const handleCancel = () => {
    // 취소 시에는 상태를 초기화하고 모달 닫기
    setNewTitle('');
    setNewDescription('');
    setImageUri(undefined);
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
    });

    if (!result.canceled) {
        const pickedImageUri = result.assets[0].uri;

        try {
            const manipResult = await ImageManipulator.manipulateAsync(
              pickedImageUri,
              [{ resize: { width: 1200 } }],
              { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            console.log('압축된 이미지 URI:', manipResult.uri);
            Alert.alert('사진 첨부', `사진이 압축 및 선택되었습니다: ${manipResult.uri.substring(0, 30)}...`);
            setImageUri(manipResult.uri);
        } catch (error) {
            console.error("이미지 압축 중 오류 발생:", error);
            Alert.alert('오류', '이미지 압축에 실패했습니다.');
            setImageUri(pickedImageUri);
        }
    }
  };

  const handleDeleteImage = () => {
    setImageUri(undefined);
  };


  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            {imageUri && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
                />
                <TouchableOpacity onPress={handleDeleteImage} style={styles.deleteImageButton}>
                  <Text style={styles.deleteImageButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={handleAttachPhoto} style={styles.attachPhotoButton}>
              <Text style={styles.attachPhotoButtonText}>사진 첨부</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
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
  previewImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
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
  imagePreviewContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  deleteImageButton: {
    position: 'absolute',
    top: 0,
    right: -10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteImageButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});