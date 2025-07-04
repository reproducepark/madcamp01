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
  Alert, // Alert를 사용하여 사용자에게 권한 요청 및 결과 알림
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // ImagePicker 임포트

interface WriteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
  // 이미지 URI를 저장할 상태를 추가할 경우, onSave에 이미지를 넘기도록 변경할 수 있습니다.
  // onSave: (title: string, description: string, imageUrl?: string) => void;
}

export function WriteModal({ visible, onClose, onSave }: WriteModalProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  // 선택된 이미지의 URI를 저장할 상태를 추가할 수 있습니다.
  // const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const handleSave = () => {
    if (newTitle.trim() === '' || newDescription.trim() === '') {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }
    onSave(newTitle, newDescription);
    setNewTitle('');
    setNewDescription('');
    // setSelectedImageUri(null); // 저장 후 이미지 URI 초기화
  };

  const handleCancel = () => {
    setNewTitle('');
    setNewDescription('');
    // setSelectedImageUri(null); // 취소 시 이미지 URI 초기화
    onClose();
  };

  const handleAttachPhoto = async () => {
    // 갤러리 접근 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        '권한 필요',
        '사진을 선택하려면 미디어 라이브러리 접근 권한이 필요합니다.'
      );
      return;
    }

    // 이미지 선택기 실행
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // 이미지만 선택
      allowsEditing: true, // 이미지 편집 허용 (크롭 등)
      aspect: [4, 3], // 편집 시 가로세로 비율
      quality: 1, // 이미지 품질 (0~1)
    });

    // 사용자가 이미지를 선택했는지 확인
    if (!result.canceled) {
      // 선택된 이미지 정보 (result.assets 배열의 첫 번째 요소)
      const pickedImageUri = result.assets[0].uri;
      console.log('선택된 이미지 URI:', pickedImageUri);
      // 여기에 선택된 이미지 URI를 상태에 저장하거나(예: setSelectedImageUri)
      // 부모 컴포넌트로 전달하는 로직을 추가할 수 있습니다.
      // setSelectedImageUri(pickedImageUri);
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
          <Text style={styles.modalHeaderTitle}>새 글 작성</Text>
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
          {/* 이미지가 선택되면 미리보기를 여기에 추가할 수 있습니다. */}
          {/* {selectedImageUri && (
            <Image source={{ uri: selectedImageUri }} style={{ width: 100, height: 100, marginTop: 10 }} />
          )} */}
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