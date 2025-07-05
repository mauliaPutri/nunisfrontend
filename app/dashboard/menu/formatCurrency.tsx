import React from 'react'

export function formatCurrency(value:number) {
    return value.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).replace('Rp', 'Rp.').trim();
}

