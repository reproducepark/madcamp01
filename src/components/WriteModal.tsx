import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { CustomAlertModal } from './CustomAlertModal';

interface WriteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, imageUri?: string, imageDeleteFlag?: boolean, imageUpdateFlag?: boolean) => void;
  initialTitle?: string;
  initialDescription?: string;
  initialImageUri?: string;
}

export function WriteModal({ visible, onClose, onSave, initialTitle, initialDescription, initialImageUri }: WriteModalProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [originalImageUri, setOriginalImageUri] = useState<string | undefined>(undefined);

  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (visible) {
      setNewTitle(initialTitle || '');
      setNewDescription(initialDescription || '');
      setImageUri(initialImageUri || undefined);
      setOriginalImageUri(initialImageUri || undefined);
      setIsAlertVisible(false);
      setAlertTitle('');
      setAlertMessage('');
    }
  }, [visible, initialTitle, initialDescription, initialImageUri]);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertVisible(true);
  };

  const handleSave = () => {
    if (newTitle.trim() === '' || newDescription.trim() === '') {
      showAlert('알림', '제목과 내용을 모두 입력해야 해요.');
      return;
    }

    let image_url_delete_flag = false;
    let image_url_update_flag = false;

    if (originalImageUri && !imageUri) {
      image_url_delete_flag = true;
    } else if (!originalImageUri && imageUri) {
      image_url_update_flag = true;
    } else if (originalImageUri && imageUri && originalImageUri !== imageUri) {
      image_url_update_flag = true;
    }

    onSave(newTitle, newDescription, imageUri, image_url_delete_flag, image_url_update_flag);
  };

  const handleCancel = () => {
    setNewTitle('');
    setNewDescription('');
    setImageUri(undefined);
    setOriginalImageUri(undefined);
    onClose();
  };

  const handleAttachPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        showAlert(
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
            setImageUri(manipResult.uri);
        } catch (error) {
            console.error("이미지 압축 중 오류 발생:", error);
            showAlert('오류', '이미지 압축에 실패했습니다.');
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
            {/* 닫기 버튼을 Image 컴포넌트로 변경 및 크기 조정 */}
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <Image 
                source={require('../../assets/icons/close.png')} 
                style={styles.closeIcon} 
              />
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
                {/* 이미지 삭제 버튼을 Image 컴포넌트로 변경 및 크기 조정 */}
                <TouchableOpacity onPress={handleDeleteImage} style={styles.deleteImageButton}>
                  <Image
                    source={require('../../assets/icons/close.png')}
                    style={styles.deleteImageIcon}
                  />
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

      <CustomAlertModal
        isVisible={isAlertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setIsAlertVisible(false)}
      />
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
    color: '#e71d36',
    fontWeight: 'bold',
  },
  closeIcon: {
    width: 15, // 아이콘 크기 조절 (줄임)
    height: 15, // 아이콘 크기 조절 (줄임)
    tintColor: '#333', // 아이콘 색상 조절
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
  // 새로 추가된 이미지 삭제 아이콘 스타일
  deleteImageIcon: {
    width: 10, // 아이콘 크기 조절 (줄임)
    height: 10, // 아이콘 크기 조절 (줄임)
    tintColor: 'white', // 흰색으로 설정하여 배경색과 대비
  },
});