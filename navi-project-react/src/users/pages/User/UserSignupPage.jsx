import { motion } from "framer-motion";
import MainLayout from "../../layout/MainLayout";
import SignupForm from "../../../common/components/Login/SignupForm";

const UserSignupPage = () => {
  return (
    <MainLayout>
      <div className="flex justify-center items-center py-12 bg-gray-50 min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-10"
        >
          <h2 className="text-3xl font-bold text-center mb-10">회원가입</h2>
          <SignupForm />
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default UserSignupPage;
