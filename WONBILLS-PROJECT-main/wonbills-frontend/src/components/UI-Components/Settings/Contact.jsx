import React from 'react';
import Accordion from '../../UI-Elements/Accordion';
import { IoNavigateCircleOutline } from "react-icons/io5";

const Contact = () => {
    return (
        <section>
            <Accordion title="Contact Us" place='bottom'>
                <div className='flex items-center gap-1 text-blue-600'>
                    <a href="mailto:contact.us@nowitservices.com" className="text-blue-600 ">
                        contact.us@nowitservices.com
                    </a>
                    <span><IoNavigateCircleOutline /></span>
                </div>
            </Accordion>
        </section>
    )
}

export default React.memo(Contact);
