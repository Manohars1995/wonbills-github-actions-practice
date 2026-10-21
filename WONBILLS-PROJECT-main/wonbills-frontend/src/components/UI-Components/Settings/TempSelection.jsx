import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Accordion from "../../UI-Elements/Accordion";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { WonBillsContext } from "../../../store/WonBillsContext";
import Modal from "../../UI-Elements/modals/Modal";
import { updateSelectedInvTemp } from "../../../services/user/user";
import { toast } from "sonner";

const TEMPLATE_PREVS = [
  { id: 1, image: "https://res.cloudinary.com/dkk0hqyat/image/upload/v1775471043/template1_btc7kt.png" },
  { id: 2, image: "https://res.cloudinary.com/dkk0hqyat/image/upload/v1775471043/template2_bxlcyb.png" },
  { id: 3, image: "https://res.cloudinary.com/dkk0hqyat/image/upload/v1775471043/template3_hyr7fi.png" }
];

const TempSelection = () => {
  const { selectedTemplate, setSelecetdTemplate } =
    useContext(WonBillsContext);

  const [isModalOpen, setModalOpen] = useState(false);
  const [currentTempId, setCurrentTempId] = useState(null);

  const originalPayloadRef = useRef(null);

  /* ---------------- SNAPSHOT ORIGINAL VALUE ---------------- */
  useEffect(() => {
    originalPayloadRef.current = selectedTemplate;
  }, [selectedTemplate]);

  const currentTemplate = useMemo(
    () => TEMPLATE_PREVS.find(t => t.id === currentTempId),
    [currentTempId]
  );

  const openModal = (tempId) => {
    setCurrentTempId(tempId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentTempId(null);
  };

  /* ---------------- SELECT TEMPLATE ---------------- */
  const handleSelect = async (tempId) => {
    const prev = originalPayloadRef.current;

    // optimistic UI
    setSelecetdTemplate(tempId);

    const toastId = toast.loading("Updating template...");

    try {
      const res = await updateSelectedInvTemp({ tempID: tempId });

      if (!res?.data?.success) {
        throw new Error();
      }

      toast.success("Template updated", { id: toastId });
      originalPayloadRef.current = tempId;
    } catch (err) {
      // rollback
      setSelecetdTemplate(prev);
      console.error(err)
      toast.error("Failed to update template", { id: toastId });
    }
  };

  return (
    <section>
      <Accordion title="Invoice Templates">
        <ul
          className="
                    flex gap-4
                    overflow-x-auto
                    pb-2
                    sm:grid sm:grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-4
                    sm:overflow-visible
                "
        >
          {TEMPLATE_PREVS.map((temp) => {
            const isSelected = selectedTemplate === temp.id;

            return (
              <li
                key={temp.id}
                style={{
                  backgroundImage: `url(${temp.image})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
                className={`
                                shrink-0
                                h-[220px] w-[160px]
                                sm:h-[260px] sm:w-[190px]
                                md:h-[280px] md:w-[200px]
                                border-2
                                rounded-2xl
                                relative
                                cursor-pointer
                                transition
                                ${isSelected ? "border-[#6EC207]" : "border-gray-300"}
                            `}
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(temp.id);
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(temp.id);
                  }}
                  className={`
                                    absolute bottom-2 right-2
                                    text-3xl
                                    ${isSelected ? "text-[#6EC207]" : "text-gray-300"}
                                `}
                >
                  <RiVerifiedBadgeFill />
                </button>
              </li>
            );
          })}
        </ul>
      </Accordion>

      {/* ---------------- PREVIEW MODAL ---------------- */}
      {isModalOpen && currentTemplate && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Template Preview"
          centered
        >
          <div
            className="
                        w-full
                        max-w-[280px]
                        h-[360px]
                        sm:h-[420px]
                        mx-auto
                        border-2
                        border-gray-400
                        rounded-2xl
                        bg-no-repeat
                        bg-contain
                        bg-center
                    "
            style={{
              backgroundImage: `url(${currentTemplate.image})`,
            }}
          />
        </Modal>
      )}
    </section>
  );

};

export default React.memo(TempSelection);
