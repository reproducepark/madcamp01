// components/NicknameModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

interface NicknameModalProps {
  isVisible: boolean; // 모달의 표시 여부
  onClose: () => void; // 모달 닫기 요청 시 호출될 함수
  onSubmit: (nickname: string) => void; // 닉네임 제출 시 호출될 함수
}

const NicknameModal: React.FC<NicknameModalProps> = ({ isVisible, onClose, onSubmit }) => {
  const [nickname, setNickname] = useState(''); // 닉네임 입력 값 상태

  const handleSubmit = () => {
    if (nickname.trim().length > 0) {
      onSubmit(nickname.trim()); // 닉네임 제출 (앞뒤 공백 제거)
      setNickname(''); // 입력 필드 초기화
    } else {
      // 닉네임이 비어있을 경우 사용자에게 알림 (선택 사항)
      console.warn('닉네임을 입력해주세요.');
      // alert('닉네임을 입력해주세요.'); // 사용자에게 직접적인 알림을 원할 경우
    }
  };

  return (
    <Modal
      animationType="fade" // 모달이 나타날 때의 애니메이션 종류
      transparent={true} // 배경을 투명하게 하여 뒤의 화면이 보이도록 함
      visible={isVisible} // 모달의 현재 표시 여부
      onRequestClose={onClose} // 안드로이드 백 버튼 클릭 시 모달 닫기
    >
      {/* 키보드가 올라올 때 입력 필드를 가리지 않도록 조정 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>닉네임 설정</Text>
          <Text style={styles.modalDescription}>
            앱에서 사용할 닉네임을 입력해주세요.
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="닉네임을 입력하세요"
            placeholderTextColor="#999"
            value={nickname}
            onChangeText={setNickname}
            maxLength={15} // 닉네임 최대 길이 제한 (예시)
            autoCapitalize="none" // 자동 대문자 비활성화
            autoCorrect={false} // 자동 수정 비활성화
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose} // 취소 버튼 클릭 시 모달 닫기
            >
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleSubmit} // 확인 버튼 클릭 시 닉네임 제출
              disabled={nickname.trim().length === 0} // 닉네임이 비어있으면 버튼 비활성화
            >
              <Text style={styles.buttonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 검정 배경
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // 모달의 너비
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row', // 가로 정렬
    justifyContent: 'space-between', // 버튼들 사이에 공간 배치
    width: '100%',
  },
  modalButton: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    flex: 1, // 버튼들이 가로 공간을 균등하게 차지
    marginHorizontal: 5, // 버튼 사이 여백
  },
  cancelButton: {
    backgroundColor: '#ccc', // 취소 버튼 색상
  },
  confirmButton: {
    backgroundColor: '#FF7E36', // 확인 버튼 색상 (당근색)
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default NicknameModal;
