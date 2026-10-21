import React, { useMemo } from 'react';
import { MdOutlineDeleteOutline } from "react-icons/md";
import { MultiReactSelect } from '../../../UI-Elements/Input-Elements/Input-tags';
import { getCategoryUI } from './utils';
import { HiPlusSm, HiMinusSm } from "react-icons/hi";

const displayCols = [
    { field: "name", headerName: 'Name' },
    { field: "in_stock", headerName: 'In Stock' },
    { field: "unit_price", headerName: 'Unit Price' },
    { field: "tax", headerName: 'Tax(%)' },
    { field: "discount", headerName: 'Discount(%)' },
    { field: "category", headerName: 'Category' },
    { field: "quantity", headerName: 'Quantity' },
    { field: "final_price", headerName: 'Final Price' },
    { field: "total", headerName: 'Total' }
];

const ItemsTable = ({ items = [], masterItems = [], onQuantity = (() => { }), onRemoveItem = (() => { }), isClosed = false }) => {
    return (
        <div className={`w-full max-h-80 overflow-auto flex justify-center mt-4 ${items?.length > 0 ? "border-2 border-gray-300 rounded-xl" : "border-none"}`}>
            <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-200">
                    <tr className="text-sm">
                        {displayCols.map((col, index) => (
                            <th key={index} className="px-2 py-2 whitespace-nowrap text-left ">{col.headerName}</th>
                        ))}
                        <th className="px-2 py-2 w-16 rounded-tr-xl text-left">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {items?.length > 0 && items?.map((row, index) => {
                        //  FIND THE LIVE STOCK FROM MASTER LIST
                        const masterStock = masterItems.find(m => m.id === row.id)?.in_stock;

                        return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors border-b last:border-none border-black/40">
                                {displayCols.map((col, colIndex) => (
                                    <td key={colIndex} className="px-2 py-2 text-sm whitespace-nowrap">
                                        {/* IF COLUMN IS IN_STOCK, SHOW LIVE VALUE, ELSE SHOW ROW VALUE */}
                                        {col.field === 'in_stock' ? (row.category === 'product' ? masterStock : '--') : (row[col.field] ?? "--")}
                                    </td>
                                ))}

                                <td className="px-2 py-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-2 w-13">
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => onQuantity('minus', row?.id)}
                                                    disabled={isClosed || Number(row?.quantity) === 1}
                                                    className="disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xl bg-gray-100 hover:bg-gray-200 rounded-full"
                                                >
                                                    <HiMinusSm />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onQuantity('plus', row?.id)}
                                                    disabled={
                                                        isClosed ||
                                                        (row.category === 'product' && Number(masterStock) <= 0)
                                                    }
                                                    className="disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xl bg-gray-100 hover:bg-gray-200 rounded-full"
                                                >
                                                    <HiPlusSm />
                                                </button>
                                            </>
                                        </div>
                                        <button
                                            type='button'
                                            disabled={isClosed}
                                            className="text-red-500 hover:text-red-700 text-xl cursor-pointer p-0.5 rounded-full hover:bg-red-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                            onClick={() => onRemoveItem(row?.id)}
                                        >
                                            <MdOutlineDeleteOutline />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};


const ItemsComponent = ({ items = [], invoiceDetails = {}, onChange = (() => { }), onChangeQuantity = (() => { }), onRemoveItem = (() => { }) }) => {

    const selectedItems = invoiceDetails.items?.value || [];

    const itemOptions = useMemo(() => {
        return items.map((item) => {
            const { Icon, className } = getCategoryUI(item.category);
            const isOutOfStock = item.category === "product" && Number(item.in_stock) === 0;

            return {
                value: item.id,
                meta: item,
                isDisabled: isOutOfStock, // 🚨 key change
                label: (
                    <div
                        className={`grid grid-cols-[2fr_3fr_1fr] items-center gap-3 w-full ${isOutOfStock ? "opacity-40 pointer-events-none" : ""
                            }`}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-semibold truncate">{item.id}</span>

                            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-xl font-medium ${className}`}>
                                {Icon && <Icon size={14} />}
                                {item.category}
                            </span>

                            {item.category === "product" && (
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${isOutOfStock
                                        ? "bg-red-100 text-red-600"
                                        : "bg-green-100 text-green-700"
                                        }`}
                                >
                                    {item.in_stock}
                                </span>
                            )}
                        </div>

                        <div className="text-sm font-medium truncate">{item.name}</div>

                        <div className="text-sm font-semibold text-right">
                            ₹{item.final_price}
                        </div>
                    </div>
                )
            };
        });
    }, [items]);


    const selectedOptions = useMemo(() => {
        return itemOptions.filter(opt =>
            selectedItems.some(item => item.id === opt.value)
        );
    }, [itemOptions, selectedItems]);


    // map id → option reference
    const optionMap = useMemo(() => {
        return new Map(itemOptions.map(opt => [opt.value, opt]));
    }, [itemOptions]);

    const isClosed =
        invoiceDetails?.status?.value === 'closed' ||
        invoiceDetails?.status?.value === 'inactive';

    return (
        <div>
            <MultiReactSelect
                id="items"
                label="Items *"
                options={itemOptions}
                value={selectedOptions}
                onChange={(selectedIds, isValid) => {
                    const selectedFullItems = items.filter(item =>
                        selectedIds.includes(item.id)
                    );
                    onChange(selectedFullItems, isValid);
                }}
                isReadOnly={isClosed}
            />


            <ItemsTable
                items={selectedItems}
                masterItems={items}
                onQuantity={onChangeQuantity}
                onRemoveItem={onRemoveItem}
                isClosed={isClosed}
            />
        </div>
    );
};



export default React.memo(ItemsComponent);
