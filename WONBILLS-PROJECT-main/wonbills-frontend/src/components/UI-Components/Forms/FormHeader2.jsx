import { IoArrowBackCircleOutline } from "react-icons/io5";
import ToggleSwitch from '../../UI-Elements/ToggleSwitch/Switch';
import { useNavigate } from "react-router-dom";

const FormHeader2 = ({ header = '', checked, setChecked = (() => { }) }) => {
    const navigate = useNavigate();

    const onBack = () => navigate(-1)
    return (
        <div className='w-full h-11 flex justify-between items-center'>
            <div className='flex gap-2 '>
                {/* back button */}
                <button
                    type="button"
                    onClick={onBack}
                    className='text-3xl cursor-pointer'
                >
                    <IoArrowBackCircleOutline />
                </button>

                {/* header */}
                <h2 className='text-lg font-bold text-black/8-0'>{header}</h2>
            </div>


            {/* toggle switch */}
            <ToggleSwitch field='status' label={true} checked={checked} setChecked={(f, v, i) => setChecked(f, v, true)} />
        </div>
    )
}

export default FormHeader2
