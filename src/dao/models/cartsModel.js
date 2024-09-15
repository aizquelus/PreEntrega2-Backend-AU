import mongoose from "mongoose";

const cartsColl = "carts";
const cartsSchema = new mongoose.Schema(
    {
        products: {
            type: [ 
                {
                    product: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "products"
                    },
                    quantity: Number
                }
            ]
        }
    },
    {
        timestamps:true
    }
)

cartsSchema.pre('findOne', function () {
    this.populate('products.product');
});

cartsSchema.pre('find', function () {
    this.populate('products.product');
});

export const cartsModel = mongoose.model(
    cartsColl,
    cartsSchema
)
