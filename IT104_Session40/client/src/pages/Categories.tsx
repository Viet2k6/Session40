import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Table,
} from "antd";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

type CategoryStatus = "active" | "inactive";

interface CategoryRow {
  id: string;
  name: string;
  description: string;
  status: CategoryStatus;
}

export default function Categories() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CategoryStatus | "">("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);

  // Fetch data
  useEffect(() => {
    axios.get("http://localhost:3001/categories").then((res) => {
      setRows(res.data);
    });
  }, []);

  // Filtered + paged data
  const filtered = useMemo(() => {
    return rows
      .filter((r) =>
        search ? r.name.toLowerCase().includes(search.toLowerCase()) : true
      )
      .filter((r) => (statusFilter ? r.status === statusFilter : true));
  }, [rows, search, statusFilter]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // Table columns
  const columns = [
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: CategoryStatus) =>
        status === "active" ? "Hoạt động" : "Ngừng",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, record: CategoryRow) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Button size="small" danger onClick={() => onDelete(record.id)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  // Handlers
  const onAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const onEdit = (row: CategoryRow) => {
    setEditing(row);
    setOpen(true);
  };

  const onDelete = (id: string) => {
    axios.delete(`http://localhost:3001/categories/${id}`).then(() => {
      setRows((prev) => prev.filter((r) => r.id !== id));
    });
  };

  const onSubmit = (values: Omit<CategoryRow, "id">) => {
    const next: CategoryRow = {
      id: editing?.id ?? uuidv4(),
      ...values,
    };

    if (editing) {
      axios
        .put(`http://localhost:3001/categories/${editing.id}`, next)
        .then(() => {
          setRows((prev) =>
            prev.map((r) => (r.id === editing.id ? next : r))
          );
          setOpen(false);
        });
    } else {
      axios.post("http://localhost:3001/categories", next).then(() => {
        setRows((prev) => [...prev, next]);
        setOpen(false);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">Quản lý danh mục</div>
        <Button type="primary" onClick={onAdd}>
          Thêm mới
        </Button>
      </div>

      <div className="flex justify-end gap-3">
        <Select
          placeholder="Trạng thái"
          style={{ width: "200px" }}
          allowClear
          value={statusFilter || undefined}
          onChange={(v) => setStatusFilter((v as CategoryStatus) || "")}
          options={[
            { value: "active", label: "Hoạt động" },
            { value: "inactive", label: "Ngừng" },
          ]}
        />
        <Input
          placeholder="Tìm kiếm"
          style={{ width: "300px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={paged}
        pagination={false}
        rowKey="id"
      />

      <div className="flex justify-end">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={filtered.length}
          onChange={setPage}
        />
      </div>

      <Modal
        title={editing ? "Sửa danh mục" : "Thêm mới danh mục"}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={onSubmit}
          initialValues={editing ?? { status: "active" }}
        >
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Chọn trạng thái!" }]}
          >
            <Select
              options={[
                { value: "active", label: "Hoạt động" },
                { value: "inactive", label: "Ngừng" },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item noStyle>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
