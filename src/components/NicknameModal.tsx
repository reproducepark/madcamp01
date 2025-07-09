// components/NicknameModal.tsx
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
  Alert, // Alert는 다른 오류 메시지 (예: 네트워크 오류)를 위해 남겨둘 수 있습니다.
} from 'react-native';
import { checkNicknameAvailability } from '../../api/user'; // checkNicknameAvailability 임포트
import { CustomAlertModal } from './CustomAlertModal'; // CustomAlertModal 임포트

interface NicknameModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (nickname: string) => void;
}

const NicknameModal: React.FC<NicknameModalProps> = ({ isVisible, onClose, onSubmit }) => {
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 닉네임 확인 중 로딩 상태
  const [isErrorAlertVisible, setIsErrorAlertVisible] = useState(false); // 커스텀 에러 알림 모달 가시성
  const [errorAlertMessage, setErrorAlertMessage] = useState(''); // 커스텀 에러 알림 메시지

  const handleSubmit = async () => {
    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length === 0) {
      setErrorAlertMessage('닉네임을 입력해주세요.');
      setIsErrorAlertVisible(true);
      return;
    }

    // 닉네임 길이 제한 (옵션: 필요에 따라 추가)
    if (trimmedNickname.length < 2 || trimmedNickname.length > 15) {
      setErrorAlertMessage('닉네임은 2자 이상 15자 이하로 입력해주세요.');
      setIsErrorAlertVisible(true);
      return;
    }

    setIsLoading(true); // 로딩 시작

    try {
      const response = await checkNicknameAvailability(trimmedNickname);

      if (response.isAvailable) {
        // 닉네임 사용 가능
        onSubmit(trimmedNickname);
        setNickname(''); // 제출 후 입력 필드 초기화
      } else {
        // 닉네임 중복 또는 사용 불가능
        setErrorAlertMessage('이미 사용 중인 닉네임입니다.');
        setIsErrorAlertVisible(true);
        // 닉네임 입력 필드를 비우지 않고 사용자가 다시 입력할 수 있도록 유지
      }
    } catch (error) {
      console.error('닉네임 중복 확인 에러:', error);
      // 네트워크 오류 등 심각한 오류는 기존 Alert.alert를 사용하거나 CustomAlertModal을 확장하여 사용
      Alert.alert('오류', '닉네임 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  const handleCancel = () => {
    setNickname('');
    onClose();
  };

  // 커스텀 에러 알림 모달 닫기 핸들러
  const handleErrorAlertClose = () => {
    setIsErrorAlertVisible(false);
    setErrorAlertMessage('');
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={styles.fullScreenModalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>닉네임 설정</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.headerButton}
            // 닉네임이 비어있거나 로딩 중일 때 '완료' 버튼 비활성화
            disabled={nickname.trim().length === 0 || isLoading}
          >
            <Text
              style={[
                styles.headerButtonText,
                (nickname.trim().length === 0 || isLoading) && styles.disabledButtonText,
              ]}
            >
              {isLoading ? '확인 중...' : '완료'}
            </Text>
          </TouchableOpacity>
        </View>

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
            maxLength={15}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading} // 로딩 중에는 입력 비활성화
          />
        </View>
      </SafeAreaView>

      {/* 닉네임 오류를 위한 CustomAlertModal */}
      <CustomAlertModal
        isVisible={isErrorAlertVisible}
        title="닉네임 오류"
        message={errorAlertMessage}
        onClose={handleErrorAlertClose}
        confirmText="확인"
      />
    </Modal>
  );
};

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
    backgroundColor: 'white',
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
  disabledButtonText: {
    color: '#ccc',
  },
  modalBody: {
    flex: 1,
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