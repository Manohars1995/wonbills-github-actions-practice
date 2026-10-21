import React from 'react';
import AvtarImage from '../AvatarImage';
import FormFields from './FormFields';
import { BtnTag } from '../../../UI-Elements/Input-Elements/Input-tags';


const Form = ({ ID = 'new', clientDetails = {}, onChange = (() => { }), onSubmit = (() => { }), loading = false }) => {
    return (
        <div className="flex-1 w-full overflow-y-auto flex flex-col px-3 py-2">
            <div className='w-full h-fit flex items-center justify-center'>
                <AvtarImage value={clientDetails?.profile_picture?.value} onChangeVal={(val, isValid) => onChange('profile_picture', val, true)} />
            </div>

            <form className='flex-1 '>
                <FormFields
                    clientDetails={clientDetails}
                    onChange={onChange}
                />
                <div className="w-full flex justify-end mt-4">
                    <BtnTag
                        type='button'
                        BtnText={ID === 'new' ? 'Submit' : 'Update'}
                        loading={loading}
                        onClick={onSubmit}
                        styles='bg-[#3965FF] w-60 h-10 text-white border-2 border-[#3965FF] hover:bg-[#2F52CC] transition-all duration-200'
                    />
                </div>

                {/* 🔒 Interaction blocker */}
                {loading && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px] z-10 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-[#3965FF] font-medium">
                            <span className="loader" />
                            Submitting...<span className="typing-dots" />
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}

export default Form
