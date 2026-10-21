import React, { useEffect, useMemo } from 'react';
import {
  InputTag,
  TextareaTag,
  ReactSelect,
  CheckBoxTag
} from '../../../UI-Elements/Input-Elements/Input-tags';
import { paymentModeOptions, formatNumToCurrency } from './utils';

const COMMISSION_RATE = 0.03;

const PurchaseDetails = React.memo(
  ({ ID, invoices, PurchaseState, onChange = () => { }, invsLoading = false }) => {

    /* ---------------- Invoice Options ---------------- */
    const invoiceOptions = useMemo(() => {
      if (!Array.isArray(invoices)) return [];

      return invoices.map((invoice) => ({
        value: invoice._id,
        label: (
          <div className="flex justify-between">
            <h2 className="font-semibold text-sm">{invoice.custom_id}</h2>
            <span className="text-xs bg-yellow-200 px-2 rounded-2xl">
              {invoice.client_name}
            </span>
          </div>
        ),
        meta: invoice
      }));
    }, [invoices]);

    /* ---------------- Selected Invoice ---------------- */
    const selectedInvoiceData = useMemo(() => {
      return invoices?.find(
        (inv) => inv._id === PurchaseState?.invoice_id?.value
      ) || null;
    }, [invoices, PurchaseState?.invoice_id?.value]);

    /* ---------------- Amounts ---------------- */
    const grossAmount = useMemo(() => {
      return Number(selectedInvoiceData?.gross_amount) || 0;
    }, [selectedInvoiceData]);

    const isOnlinePayment =
      PurchaseState?.mode_of_payment?.value === "online_payment";

    /* ---------------- Commission Fee ---------------- */
    const commissionFee = useMemo(() => {
      if (!isOnlinePayment) return 0;
      return Math.round(grossAmount * COMMISSION_RATE * 100) / 100;
    }, [grossAmount, isOnlinePayment]);

    /* ---------------- Charges (Displayed) ---------------- */
    const charges = useMemo(() => {
      if (!isOnlinePayment) return 0;
      return commissionFee;
    }, [isOnlinePayment, commissionFee]);

    /* ---------------- Total (Customer Pays) ---------------- */
    const total = useMemo(() => {
      if (!selectedInvoiceData) return formatNumToCurrency(0);

      if (!isOnlinePayment) {
        return formatNumToCurrency(grossAmount);
      }

      const amount = PurchaseState?.commission_by_customer?.value
        ? grossAmount + commissionFee
        : grossAmount;

      return formatNumToCurrency(amount);
    }, [
      selectedInvoiceData,
      isOnlinePayment,
      grossAmount,
      commissionFee,
      PurchaseState?.commission_by_customer?.value
    ]);

    /* ---------------- Vendor Net Amount ---------------- */
    const vendorNetAmount = useMemo(() => {
      if (!isOnlinePayment) return grossAmount;

      return PurchaseState?.commission_by_customer?.value
        ? grossAmount
        : grossAmount - commissionFee;
    }, [
      isOnlinePayment,
      grossAmount,
      commissionFee,
      PurchaseState?.commission_by_customer?.value
    ]);

    /* ---------------- Sync Invoice Fields ---------------- */
    useEffect(() => {
      if (!selectedInvoiceData) return;

      onChange("client_name", selectedInvoiceData.client_name, true);
      onChange("invoice_amount", selectedInvoiceData.gross_amount, true);
    }, [selectedInvoiceData, onChange]);

    /* ---------------- Render ---------------- */
    return (
      <div>
        <h3 className="text-md font-bold text-black/70">Purchase Details</h3>

        <div className="grid grid-cols-3 gap-3 mt-2">

          <ReactSelect
            id="invoice"
            label="Invoice *"
            options={invoiceOptions}
            value={invoiceOptions.find(
              (opt) => opt.value === PurchaseState?.invoice_id?.value
            )}
            onChange={(v, isValid) =>
              onChange("invoice_id", v, isValid)
            }
            loading={invsLoading}
            readonly={ID !== 'new'}
          />

          <InputTag
            id="client"
            label="Client *"
            value={selectedInvoiceData?.client_name || ""}
            readonly
          />

          <InputTag
            id="due_date"
            type="date"
            label="Due Date *"
            value={PurchaseState?.payment_due_date?.value}
            onChangeVal={(v, isValid) =>
              onChange("payment_due_date", v, isValid)
            }
            min={new Date().toISOString().split('T')[0]} // today as minimum
            styles='uppercase'
          />

          <div className="col-span-3">
            <TextareaTag
              id="notes"
              label="Notes"
              value={PurchaseState?.notes?.value}
              onChangeVal={(v, isValid) =>
                onChange("notes", v, isValid)
              }
            />
          </div>

          <ReactSelect
            id="mode_of_payment"
            label="Mode Of Payment *"
            options={paymentModeOptions}
            value={paymentModeOptions.find(
              (opt) => opt.value === PurchaseState?.mode_of_payment?.value
            )}
            onChange={(v, isValid) =>
              onChange("mode_of_payment", v, isValid)
            }
          />

          {isOnlinePayment && (
            <>
              <InputTag
                id="schedule_date"
                type="date"
                label="Schedule Date *"
                value={PurchaseState?.schedule_date?.value}
                onChangeVal={(v, isValid) =>
                  onChange("schedule_date", v, isValid)
                }
                min={new Date().toISOString().split('T')[0]} // today as minimum
                styles='uppercase'
              />

              <CheckBoxTag
                label="Collect Service Charges From Customer"
                checked={PurchaseState?.commission_by_customer?.value}
                onChangeVal={(v, isValid) =>
                  onChange("commission_by_customer", v, isValid)
                }
              />
            </>
          )}

          {["cash", "cheque"].includes(PurchaseState?.mode_of_payment?.value) && (
            <CheckBoxTag
              label="Received"
              checked={PurchaseState?.payment_state?.value === "received"}
              onChangeVal={(v, isValid) =>
                onChange(
                  "payment_state",
                  v ? "received" : "requested",
                  isValid
                )
              }
            />
          )}

          {PurchaseState?.mode_of_payment?.value === "cheque" && (
            <InputTag
              id="cheque_no"
              type="number"
              label="Cheque No *"
              value={PurchaseState?.cheque_number?.value}
              onChangeVal={(v, isValid) =>
                onChange("cheque_number", v, isValid)
              }
            />
          )}
        </div>


        {/* ---------------- Totals ---------------- */}
        <section className="mt-6">
          <div className="grid grid-cols-3 gap-3">

            <div className="h-10 flex justify-between items-center px-3 rounded-xl bg-yellow-50">
              <h3>Purchase Amount :</h3>
              <p className="font-semibold">
                ₹ {formatNumToCurrency(grossAmount)}
              </p>
            </div>

            <div className="h-10 flex justify-between items-center px-3 rounded-xl bg-red-50">
              <h3>Charges (3%) :</h3>
              <p className="font-semibold text-gray-600">
                ₹ {formatNumToCurrency(charges)}
              </p>
            </div>

            <div className="h-10 col-span-2 flex justify-between items-center px-3 rounded-xl bg-blue-100">
              <h3>Total (Customer Pays) :</h3>
              <p className="font-semibold">
                ₹ {total}
              </p>
            </div>

            {isOnlinePayment && (
              <div className="h-10 col-span-2 flex justify-between items-center px-3 rounded-xl bg-green-100">
                <h3>Vendor Receives :</h3>
                <p className="font-semibold">
                  ₹ {formatNumToCurrency(vendorNetAmount)}
                </p>
              </div>
            )}

          </div>
        </section>
      </div>
    );
  }
);

const FormFields = ({ ID, invoices, PurchaseState, onChange, invsLoading }) => {
  return (
    <div className="h-full">
      <PurchaseDetails
        ID={ID}
        invoices={invoices}
        PurchaseState={PurchaseState}
        onChange={onChange}
        invsLoading={invsLoading}
      />
    </div>
  );
};

export default React.memo(FormFields);
