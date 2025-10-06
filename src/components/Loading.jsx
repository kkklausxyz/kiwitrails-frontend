import { Spin } from "antd";

export default function Loading({ text = "Generating recommendations…" }) {
  return (
    <div className="flex items-center gap-3 text-gray-600 p-2">
      <Spin />
      <span className="text-sm">{text}</span>
    </div>
  );
}
