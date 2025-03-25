import "./App.css";
import { Route, Routes } from "react-router-dom";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import Register from "./pages/Register";
import AddVariant from "./components/AddVariant";
import "bootstrap/dist/css/bootstrap.min.css";
import SellerPro from "./pages/SellerPro";
import ProductList from "./pages/ProductList";
import { Toaster } from "react-hot-toast";
import Admin from "./pages/Admin";
import VendorDetails from "./pages/VendorDetails";
import OrderDetails from "./pages/OrderDetails";
import UserManagement from "./pages/UserManagement";
import Review from "./pages/Review";
import VendorApprove from "./pages/VendorApprove";
import VendorView from "./pages/VendorView";
import ViewProduct from "./pages/ViewProduct/ViewProduct";
import CategoryType from "./pages/Categories/CategoryType/CategoryType";
import ViewCategories from "./pages/Categories/category/ViewCategories";
import AddCategoryType from "./pages/Categories/CategoryType/AddCategoryType";
import ViewCategoryType from "./pages/Categories/CategoryType/ViewCategoryType";
import SubCategories from "./pages/Categories/SubCategories/SubCategories";
import AddCategory from "./pages/Categories/category/AddCategory";
import Category from "./pages/Categories/category/Category";
import AddSubCategories from "./pages/Categories/SubCategories/AddSubCategories";
import ViewSubCategories from "./pages/Categories/SubCategories/ViewSubcategories";
import BankManagement from "./pages/Others/Bank/BankManagement";
import CountryManagement from "./pages/Others/Country/CountryManagement";
import StateManagement from "./pages/Others/State/StateManagement";
import ViewBank from "./pages/Others/Bank/ViewBank";
import AddBank from "./pages/Others/Bank/AddBank";
import ViewCountry from "./pages/Others/Country/ViewCountry";
import AddCountry from "./pages/Others/Country/AddCountry";
import ViewState from "./pages/Others/State/ViewState";
import AddState from "./pages/Others/State/AddState";
import Commision from "./pages/Commision/Commision";
import AdminLogin from "./pages/Auth/AdminLogin";
import ForgetPassword from "./pages/Auth/ForgetPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import SellerFormSettings from "./pages/SellerFormSettings";
import ShopPageSettings from "./pages/ShopPageSettings";
import AddSeller from "./pages/AddSeller/AddSeller";
import TransactionPage from "./pages/Transaction/Transaction";
import Configuration from "./pages/Configuration/Configuration";
import SellerAnalytics from "./pages/SellerAnalytics/SellerAnalytics";
import Privacy from "./pages/Privacy";
import Pending from "./pages/Pending";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Wrap all pages inside Layout to ensure header/footer are present */}
        <Route path="/" element={<PrivateRoute component={<Layout />} />}>
          <Route index element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/sellers" element={<VendorDetails />} />
          <Route path="/orders" element={<OrderDetails />} />
          <Route path="/user" element={<UserManagement />} />
          <Route path="/reviews" element={<Review />} />
          <Route path="/vendor-approve/:vendorId" element={<VendorApprove />} />
          <Route path="/vendor-view/:vendorId" element={<VendorView />} />
          <Route path="/category-Type" element={<CategoryType />} />
          <Route path="/category" element={<Category />} />
          <Route path="/view-category/:id" element={<ViewCategories />} />
          <Route path="/viewcategorytype/:id" element={<ViewCategoryType />} />
          <Route path="/add-Categorytype" element={<AddCategoryType />} />
          <Route path="/add-category" element={<AddCategory />} />
          <Route path="/sub-category" element={<SubCategories />} />
          <Route path="/add-subcategory" element={<AddSubCategories />} />
          <Route path="view-subcategory/:id" element={<ViewSubCategories />} />
          <Route path="/bank-management" element={<BankManagement />} />
          <Route path="/country-management" element={<CountryManagement />} />
          <Route path="/state-management" element={<StateManagement />} />
          <Route path="/view-bank/:id" element={<ViewBank />} />
          <Route path="/add-bank" element={<AddBank />} />
          <Route path="/view-country/:id" element={<ViewCountry />} />
          <Route path="/add-country" element={<AddCountry />} />
          <Route path="/view-state/:id" element={<ViewState />} />
          <Route path="/add-state" element={<AddState />} />
          <Route
            path="/seller-form-settings"
            element={<SellerFormSettings />}
          />
          <Route path="/shop-page-settings" element={<ShopPageSettings />} />
          <Route path="view-product/:id" element={<ViewProduct />} />
          <Route path="/product-list" element={<ProductList />} />
          <Route
            path="/seller-profile"
            element={<PrivateRoute component={<SellerPro />} />}
          />
          <Route path="/Commision" element={< PrivateRoute component={<Commision />} />} />
          <Route
            path="/transaction"
            element={<PrivateRoute component={<TransactionPage />} />}
          />
          <Route
            path="/configuration"
            element={<PrivateRoute component={<Configuration />} />}
          />
          <Route path="add-seller" element={<AddSeller />} />

          <Route path="add-variant" element={<AddVariant />} />


          <Route path="/seller-profile" element={<SellerPro />} />
          <Route path="/Commision" element={<Commision />} />



          <Route path="add-variant" element={<AddVariant />} />
          <Route path="seller-analytics" element={<SellerAnalytics />} />

          <Route path="privacy-settings" element={<Privacy/>}/>
          <Route path="pending" element={<Pending/>}/>
        </Route>


      </Routes>
    </>
  );
}

export default App;
