import React from 'react';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';
import './PromotionModal.css';

const PromotionModal = ({ isOpen, onClose, onShowRegisterModal }) => {
    const { t } = useTranslation();

    const handleRegisterClick = (role) => {
        onShowRegisterModal(role);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="promotion-modal-content">
                <button onClick={onClose} className="close-button">X</button>
                <h2>{t('promotionModal.title')}</h2>
                <p>{t('promotionModal.description')}</p>
                <div className="buttons-container">
                    <button onClick={() => handleRegisterClick('player')} className="modal-button">
                        {t('promotionModal.registerPlayer')}
                    </button>
                    <button onClick={() => handleRegisterClick('club')} className="modal-button">
                        {t('promotionModal.registerClub')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PromotionModal;
