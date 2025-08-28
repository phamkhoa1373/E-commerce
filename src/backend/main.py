from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pytz
from streamlit import status
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import List, Optional
from datetime import datetime
from pydantic import EmailStr

load_dotenv()

app = FastAPI()
vn_tz = pytz.timezone("Asia/Ho_Chi_Minh")
current_time = datetime.now(vn_tz)
# CORS
app.add_middleware( 
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Models
class Category(BaseModel):
    id: int
    name: str
    description: str
    image: str

class Product(BaseModel):
    id: Optional[int] = None
    name: str
    price: float
    categoryId: Optional[int] = None
    addedAt: Optional[datetime] = None
    image: Optional[str] = None
    description: str
    stock: int

    class Config:
        orm_mode = True

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class CartItem(BaseModel):
    user_id: str
    product_id: int
    quantity: int
    
class OrderItem(BaseModel):
    product_id: int
    quantity: int
    price: float

class CreateOrder(BaseModel):
    user_id: str
    shipping_name: str
    shipping_address: str
    shipping_phone: str
    items: List[OrderItem]

class StatusUpdate(BaseModel):
    status: str

class HistoryAction(BaseModel):
    user_id: str
    product_id: int
    history: dict

def log_history(user_id: str, product_id: int, action: str, details: dict = {}):
    try:
        history_entry = {
            "action": action,
            "details": details
        }
        supabase.table("history_actions").insert({
            "user_id": user_id,
            "product_id": product_id,
            "history": history_entry
        }).execute()
    except Exception as e:
        print(f"Error logging history: {e}")

# Routes
@app.post("/auth/register")
def register(user: UserRegister):
    try:
        # Đăng ký với Supabase Auth
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })

        if response.user is None:
            raise HTTPException(status_code=400, detail="Registration failed")

        user_id = response.user.id

        # Insert vào bảng profile
        profile_data = {
            "id": user_id,
            "username": user.username,
            "email": user.email,
            "role": "user"  # mặc định user
        }

        supabase.table("profile").insert(profile_data).execute()

        return {
            "message": "User registered successfully",
            "user": {
                "id": user_id,
                "email": user.email,
                "username": user.username
            }
        }
    except Exception as e:
        print(f"Register error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/auth/login")
def login(data: UserLogin):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })

        if hasattr(response, 'user') and hasattr(response, 'session'):
            user = response.user
            session = response.session
        else:
            user = response.get('user')
            session = response.get('session')

        if not user or not session:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Lấy role từ bảng profile
        profile_res = supabase.table("profile").select("role").eq("id", user.id).execute()
        role = profile_res.data[0]["role"] if profile_res.data else "user"

        return {
            "session": {
                "access_token": session.access_token,
                "refresh_token": session.refresh_token,
                "expires_at": session.expires_at
            },
            "user": {
                "id": user.id,
                "email": user.email,
                "role": role
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def read_root():
    return {"message": "Ecommerce API is running"}

@app.get("/categories", response_model=List[Category])
def get_categories():
    try:
        result = supabase.table('categories').select('*').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/categories/{category_id}", response_model=Category)
def get_category(category_id: int):
    try:
        result = supabase.table('categories').select('*').eq('id', category_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Category not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from datetime import datetime, timedelta

@app.get("/products")
async def get_products(
    category_id: Optional[int] = None,
    month: Optional[str] = None,  # YYYY-MM
    week: Optional[int] = None    # 1-5
):
    try:
        query = supabase.table('products').select('*')

        if category_id:
            query = query.eq('categoryId', category_id)

        if month:
            year, month_num = map(int, month.split("-"))
            start_of_month = datetime(year, month_num, 1)
            if month_num == 12:
                end_of_month = datetime(year + 1, 1, 1)
            else:
                end_of_month = datetime(year, month_num + 1, 1)

            query = query.gte('addedAt', start_of_month.isoformat()).lt('addedAt', end_of_month.isoformat())

            if week:
                first_day_week = start_of_month + timedelta(days=(week - 1) * 7)
                last_day_week = first_day_week + timedelta(days=6)
                query = query.gte('addedAt', first_day_week.isoformat()).lt('addedAt', last_day_week.isoformat())

        query = query.order('addedAt', desc=True)
        result = query.execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching products: {str(e)}")


@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    try:
        result = supabase.table('products').select('*').eq('id', product_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Product not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cart/add")
def add_to_cart(item: CartItem):
    try:
        # Kiểm tra sản phẩm đã có chưa
        existing = supabase.table("cart").select("*") \
            .eq("user_id", item.user_id).eq("product_id", item.product_id).execute()

        if existing.data:
            # update quantity
            new_quantity = existing.data[0]["quantity"] + item.quantity
            supabase.table("cart").update({"quantity": new_quantity}) \
                .eq("user_id", item.user_id).eq("product_id", item.product_id).execute()
        else:
            # insert mới
            supabase.table("cart").insert({
                "user_id": item.user_id,
                "product_id": item.product_id,
                "quantity": item.quantity
            }).execute()

        return {"message": "Added to cart"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/cart/{user_id}")
def get_cart(user_id: str):
    try:
        result = supabase.table("cart").select("*, products(*)").eq("user_id", user_id).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/cart/{user_id}/{product_id}")
def remove_from_cart(user_id: str, product_id: int):
    try:
        supabase.table("cart").delete().eq("user_id", user_id).eq("product_id", product_id).execute()
        return {"message": "Removed from cart"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/cart/clear/{user_id}")
def clear_cart(user_id: str):
    try:
        supabase.table("cart").delete().eq("user_id", user_id).execute()
        return {"message": "Cart cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search")
def search_products(q: str = Query(..., min_length=1)):
    response = supabase.table("products") \
        .select("id, name, image, price") \
        .ilike("name", f"%{q}%") \
        .limit(5) \
        .execute()
    return response.data

# Create product
@app.post("/products")
async def create_product(product: dict = Body(...)):
    try:
        # Xử lý user_id
        user_id = product.pop("user_id", "admin")

        if "id" in product:
            del product["id"]

        # Kiểm tra trường bắt buộc
        required_fields = ["name", "price", "stock", "description", "image"]
        for field in required_fields:
            if field not in product:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

        # Giá trị mặc định
        if "addedAt" not in product:
            product["addedAt"] = datetime.now().isoformat()

        result = supabase.table("products").insert(product).execute()

        if result.data:
            log_history(user_id, result.data[0]["id"], "create", {"product": product})

        return {"message": "Product created successfully", "data": result.data}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error creating product: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Update product
@app.put("/products/{product_id}")
async def update_product(product_id: int, product: dict = Body(...)):
    try:
        if "id" in product:
            del product["id"]

        user_id = product.pop("user_id", "admin")  # Lấy user_id nếu có

        existing = supabase.table("products").select("*").eq("id", product_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Product not found")

        result = supabase.table("products").update(product).eq("id", product_id).execute()

        if result.data:
            log_history(user_id, product_id, "update", {"update": product})

        return {"message": "Product updated successfully", "data": result.data}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error updating product: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Delete product
@app.delete("/products/{product_id}")
def delete_product(product_id: int, payload: dict = Body(...)):
    try:
        user_id = payload.get("user_id", "admin")

        # Lấy thông tin sản phẩm trước khi xóa để lưu log
        existing = supabase.table("products").select("*").eq("id", product_id).execute()
        product_info = existing.data[0] if existing.data else None

        # Thực hiện xóa
        res = supabase.table("products").delete().eq("id", product_id).execute()

        # Ghi lịch sử (ngay cả khi sản phẩm đã bị xóa hoặc không tồn tại)
        log_history(user_id, product_id, "delete", {"deleted_product": product_info})

        if not existing.data:
            return {"message": "Product not found (already deleted)"}

        return {"message": "Product deleted successfully"}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error deleting product: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/products/{product_id}/status")
async def update_product_status(product_id: int, data: dict = Body(...)):
    try:
        status = data.get("status")
        user_id = data.get("user_id", "admin")

        result = supabase.table("products").update({"status": status}).eq("id", product_id).execute()

        # Luôn ghi log (kể cả khi status không đổi)
        log_history(user_id, product_id, "status_change", {"status": status})

        return {"message": "Status updated", "data": result.data}

    except Exception as e:
        print(f"Error updating status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating status: {str(e)}")

@app.post("/checkout")
def create_order(order: CreateOrder):
    print(order.dict())
    try:
        # Kiểm tra và trừ stock
        for item in order.items:
            product_res = supabase.table("products").select("stock").eq("id", item.product_id).execute()
            if not product_res.data:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            
            current_stock = product_res.data[0]["stock"]
            if current_stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Not enough stock for product {item.product_id}")
            
            # Trừ stock
            new_stock = current_stock - item.quantity
            supabase.table("products").update({"stock": new_stock}).eq("id", item.product_id).execute()

        # Tính tổng tiền
        total_amount = sum(item.price * item.quantity for item in order.items)

        # Tạo đơn hàng
        order_res = supabase.table("orders").insert({
            "user_id": order.user_id,
            "total_amount": total_amount,
            "shipping_name": order.shipping_name,
            "shipping_address": order.shipping_address,
            "shipping_phone": order.shipping_phone,
            "created_at": current_time.isoformat()
        }).execute()
        print(order_res)
        order_id = order_res.data[0]["id"]

        # Thêm order_items
        order_items = [
            {
                "order_id": order_id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": item.price
            } for item in order.items
        ]
        supabase.table("order_items").insert(order_items).execute()

        # Xóa các sản phẩm đã mua khỏi cart
        for item in order.items:
            supabase.table("cart").delete().eq("user_id", order.user_id).eq("product_id", item.product_id).execute()

        return {"message": "Order created successfully", "order_id": order_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orders")
def get_orders():
    try:    
        # Lấy danh sách đơn hàng
        orders_res = supabase.table("orders").select("*").execute()
        orders = orders_res.data

        for order in orders:
            # Lấy order_items cho đơn hàng
            items_res = supabase.table("order_items").select("*, products(*)") \
                .eq("order_id", order["id"]).execute()
            order["order_items"] = items_res.data

        return orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/orders/{order_id}/status")
def update_order_status(order_id: int, data: StatusUpdate):
    try:
        valid_statuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled']
        if data.status not in valid_statuses:
            raise HTTPException(status_code=400, detail="Invalid status")

        # Lấy đơn hàng hiện tại
        order_res = supabase.table("orders").select("status").eq("id", order_id).execute()
        if not order_res.data:
            raise HTTPException(status_code=404, detail="Order not found")

        current_status = order_res.data[0]["status"]

        # Nếu đã completed hoặc cancelled, disable nút
        if current_status in ['completed', 'cancelled']:
            raise HTTPException(status_code=400, detail="Cannot change status for completed or cancelled orders")

        # Nếu chuyển sang cancelled, cộng lại stock
        if data.status == "cancelled":
            items_res = supabase.table("order_items").select("product_id, quantity").eq("order_id", order_id).execute()
            for item in items_res.data:
                # Lấy stock hiện tại
                product_res = supabase.table("products").select("stock").eq("id", item["product_id"]).execute()
                if product_res.data:
                    current_stock = product_res.data[0]["stock"]
                    new_stock = current_stock + item["quantity"]
                    supabase.table("products").update({"stock": new_stock}).eq("id", item["product_id"]).execute()

        # Cập nhật status
        result = supabase.table("orders").update({"status": data.status}).eq("id", order_id).execute()

        return {"message": "Order status updated", "data": result.data}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def get_history():
    try:
        result = supabase.table("history_actions").select("*").order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)