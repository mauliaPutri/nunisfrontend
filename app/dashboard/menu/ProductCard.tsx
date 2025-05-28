import { DialogClose } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { CiSquareMinus, CiSquarePlus } from "react-icons/ci";
import { useToast } from "@/components/ui/use-toast"

const ProductCard: React.FC<{ product: any, onAddToCart: (product: any, quantity: number, discount: number, totalPrice: number,totalDiscount:number) => void }> = ({ product, onAddToCart }) => {
    const [count, setCount] = useState(0);
    const [totalPriceAll, setTotalPriceAll] = useState(0);
    const [totalPriceDiscount, setTotalPriceDiscount] = useState(0);
    const [discountedPrice, setDiscountedPrice] = useState(product.price);
    const { toast } = useToast()

    useEffect(() => {
        calculateDiscountedPrice();
    }, [product]);
    const handleDecrement = () => {
        setCount(prevCount => {
            const newCount = Math.max(prevCount - 1, 0);
            setTotalPriceAll(newCount * product.price);
            setTotalPriceDiscount(newCount * discountedPrice);
            return newCount;
        });
    };
    const handleIncrement = () => {
        setCount(prevCount => {
            const newCount = prevCount + 1;
            setTotalPriceAll(newCount * product.price);
            setTotalPriceDiscount(newCount * discountedPrice);
            return newCount;
        });
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        let newCount = inputValue === '' ? 0 : parseInt(inputValue, 10);
        if (!isNaN(newCount)) {
            setCount(newCount);
            setTotalPriceAll(newCount * product.price);
            setTotalPriceDiscount(newCount * discountedPrice);
        }
    };
    const handleAddToCart = () => {
        onAddToCart(product, count, discountedPrice, totalPriceAll, totalPriceDiscount);
    };

    const hasDiscount = product.diskon_persen > 0 || product.diskon_rupiah > 0;

    const calculateDiscountedPrice = () => {
        let price = product.price;
        if (product.diskon_persen > 0) {
            price = price - (price * (product.diskon_persen / 100));
        } else if (product.diskon_rupiah > 0) {
            price = price - product.diskon_rupiah;
        }
        setDiscountedPrice(price);
    };

    function formatCurrency(value: number) {
        return value.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).replace('Rp', 'Rp.').trim();
    }

    return (
        <div className="text-black m-3">
            <h5>{product.name}</h5>
            {hasDiscount ? (
                <div className="flex flex-row justify-content-center gap-3">
                    <span className="line-through">{formatCurrency(product.price)}</span>
                    <span>{formatCurrency(discountedPrice)}</span>
                </div>
            ) : (
                <span>{formatCurrency(product.price)}</span>
            )}
            <div className="flex justify-between pt-3 pb-2">
                <label>Total Harga</label>
                <span>{formatCurrency(totalPriceDiscount)}</span>
            </div>
            {hasDiscount && (
                <div className="flex justify-between pb-2">
                    <label>Diskon</label>
                    <span>{product.diskon_persen}%</span>
                    <span>(-) {formatCurrency(product.diskon_rupiah)}</span>
                </div>
            )}
            <div className="flex justify-between">
                <div className="flex items-center text-black">
                    <CiSquareMinus size={'40px'} onClick={handleDecrement} className="cursor-pointer" />
                    <input
                        type="number"
                        value={count}
                        onChange={handleInputChange}
                        className="mx-2 w-12 text-center"
                    />
                    <CiSquarePlus size={'40px'} onClick={handleIncrement} className="cursor-pointer" />
                </div>
                <DialogClose
                    disabled={count === 0}
                    className={'bg-[#6CC765] text-white flex-grow ms-4 rounded'}
                    onClick={(e) => {
                        handleAddToCart();
                        toast({
                            title: "Berhasil!",
                            description: "Produk berhasil ditambahkan ke keranjang",
                        });
                    }}
                >
                    Tambah
                </DialogClose>
            </div>
        </div>
    );
};

export default ProductCard