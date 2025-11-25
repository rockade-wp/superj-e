// ==================== src/components/forms/ItemsTable.tsx ====================
import React from "react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Plus, Trash2 } from "lucide-react";
import type { FormItem } from "../../types";

interface ItemsTableProps {
    items: FormItem[];
    onChange: (items: FormItem[]) => void;
    canEdit?: boolean;
}

export function ItemsTable({
    items,
    onChange,
    canEdit = true,
}: ItemsTableProps) {
    const addItem = () => {
        onChange([
            ...items,
            { nama: "", volume: 0, satuan: "", harga: 0, total: 0 },
        ]);
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof FormItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-calculate total
        if (field === "volume" || field === "harga") {
            newItems[index].total =
                newItems[index].volume * newItems[index].harga;
        }

        onChange(newItems);
    };

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                No
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                Nama Barang
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                Volume
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                Satuan
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                Harga Satuan
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                Total
                            </th>
                            {canEdit && (
                                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">
                                    Aksi
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={canEdit ? 7 : 6}
                                    className="border border-gray-300 px-3 py-4 text-center text-gray-500"
                                >
                                    Belum ada item. Klik tombol "Tambah Item"
                                    untuk menambahkan.
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-3 py-2 text-center">
                                        {index + 1}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                        {canEdit ? (
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 border border-gray-300 rounded"
                                                value={item.nama}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "nama",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Nama barang"
                                            />
                                        ) : (
                                            item.nama
                                        )}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                        {canEdit ? (
                                            <input
                                                type="number"
                                                className="w-full px-2 py-1 border border-gray-300 rounded"
                                                value={item.volume}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "volume",
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                                placeholder="0"
                                            />
                                        ) : (
                                            item.volume
                                        )}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                        {canEdit ? (
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 border border-gray-300 rounded"
                                                value={item.satuan}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "satuan",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Unit"
                                            />
                                        ) : (
                                            item.satuan
                                        )}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                        {canEdit ? (
                                            <input
                                                type="number"
                                                className="w-full px-2 py-1 border border-gray-300 rounded"
                                                value={item.harga}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "harga",
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                                placeholder="0"
                                            />
                                        ) : (
                                            item.harga.toLocaleString("id-ID")
                                        )}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-right font-medium">
                                        Rp {item.total.toLocaleString("id-ID")}
                                    </td>
                                    {canEdit && (
                                        <td className="border border-gray-300 px-3 py-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                        <tr className="bg-gray-50 font-semibold">
                            <td
                                colSpan={5}
                                className="border border-gray-300 px-3 py-2 text-right"
                            >
                                TOTAL
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right">
                                Rp {totalAmount.toLocaleString("id-ID")}
                            </td>
                            {canEdit && (
                                <td className="border border-gray-300"></td>
                            )}
                        </tr>
                    </tbody>
                </table>
            </div>

            {canEdit && (
                <Button type="button" variant="secondary" onClick={addItem}>
                    <Plus className="w-4 h-4" />
                    Tambah Item
                </Button>
            )}
        </div>
    );
}
