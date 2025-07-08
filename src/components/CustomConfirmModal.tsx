// compoents/CustomConfirmModal.tsx

import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';

interface CustomConfirmModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const { width } = Dimensions.get('window');

export function CustomConfirmModal({
  isVisible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = '삭제',
  cancelText = '취소',
}: CustomConfirmModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onCancel}
    >
      <Pressable style={styles.centeredView} onPress={onCancel}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonCancel,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={onCancel}
            >
              <Text style={styles.textStyleCancel}>{cancelText}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonConfirm,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.textStyleConfirm}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // 반투명 배경
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10, // 이미지와 비슷하게 둥근 모서리
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.8, // 너비를 화면의 80%로 설정
  },
  modalTitle: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalMessage: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '48%', // 버튼 두 개가 가로로 나란히 정렬되도록
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: '#e0e0e0', // 취소 버튼 색상
  },
  buttonConfirm: {
    backgroundColor: '#ff6f61', // 삭제 버튼 색상 (이미지의 주황색 계열)
  },
  textStyleCancel: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  textStyleConfirm: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});