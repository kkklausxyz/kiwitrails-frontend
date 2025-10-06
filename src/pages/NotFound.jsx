import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Result
        status="404"
        title="404"
        subTitle="Oops! The page you're looking for doesn't exist."
        extra={
          <Button
            type="primary"
            shape="round"
            size="large"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        }
      />
    </div>
  );
}
