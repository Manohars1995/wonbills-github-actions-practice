import React, { useContext, useState } from 'react';
import MyProfile from '../components/UI-Components/Settings/MyProfile';
import BusinessProfile from '../components/UI-Components/Settings/BusinessProfile';
import KycDetails from '../components/UI-Components/Settings/KycDetails';
import AlertNoti from '../components/UI-Components/Settings/AlertNoti';
import TempSelection from '../components/UI-Components/Settings/TempSelection';
import Invite from '../components/UI-Components/Settings/Invite';
import Faqs from '../components/UI-Components/Settings/Faqs';
import Contact from '../components/UI-Components/Settings/Contact';
import { BtnTag } from '../components/UI-Elements/Input-Elements/Input-tags';
import ConfirmModal from '../components/UI-Elements/modals/ConfirmModal';
import { deleteAccount } from '../services/auth/auth';
import { toast } from 'sonner';
import { WonBillsContext } from '../store/WonBillsContext';
import Subscription from '../components/UI-Components/Settings/Subscription';
import SEO from '../components/SEO';

const Settings = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const { logout } = useContext(WonBillsContext);

    const onDeleteAcc = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            const res = await deleteAccount();
            if (res?.data?.success) {
                toast.success('Account has been deactivated.')
                await await logout();
            }

            setShowDeleteModal(false);
        } catch (error) {
            console.error("Delete account failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SEO
                title="Settings"
                noIndex={true}
            />
            <div className="h-full overflow-y-auto pr-2 flex flex-col gap-y-3">
                <MyProfile />
                <BusinessProfile />
                <KycDetails />
                <AlertNoti />
                <TempSelection />
                <Subscription />
                <Invite />
                <Faqs />
                <Contact />

                <div className="w-full flex items-center justify-center mt-8">
                    <BtnTag
                        type="button"
                        styles="bg-red-500 text-white"
                        onClick={onDeleteAcc}
                    >
                        Delete Account
                    </BtnTag>
                </div>

                {showDeleteModal && (
                    <ConfirmModal
                        title="🔴Delete Account "
                        confirmText="Delete"
                        cancelText="Cancel"
                        loading={loading}
                        onCancel={() => setShowDeleteModal(false)}
                        onConfirm={handleConfirmDelete}
                    >
                        Are you sure you want to permanently delete your account? This action
                        cannot be undone.
                    </ConfirmModal>
                )}

            </div>
        </>
    );
};

export default React.memo(Settings);
