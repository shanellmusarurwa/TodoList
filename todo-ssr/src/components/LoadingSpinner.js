import { FaSpinner } from "react-icons/fa";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <FaSpinner className="animate-spin text-blue-500 text-4xl" />
    </div>
  );
}
