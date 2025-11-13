"use client";

import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Loader } from 'lucide-react';
import { Button } from "../ui/button";
import toast from "react-hot-toast";

const AddLessonForm = () => {
  const [outline, setOutline] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setOutline(e.target.value);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!outline.trim()) {
      setMessage("Please enter a lesson outline");
      return;
    }
    setLoading(true)
    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outline }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to generate lesson");
      }

      toast.success("Lesson generating successfully!");
      setOutline("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage(error.message || "Something went wrong");
    }finally{
      setLoading(false)
    }
  };

  const handleOnClear = () => {
    setOutline("");
    setMessage(null);
  };

  return (
    <div className="border border-white rounded-2xl p-4 w-[500px] max-w-md mx-auto">
      <div className="flex justify-center mb-4">
        <h1 className="text-xl font-semibold">Add Lesson</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="outline">Lesson Outline</Label>
          <Input
            name="outline"
            placeholder="Enter lesson outline"
            value={outline}
            onChange={handleOnChange}
          />
        </div>

        {message && (
          <div
            className={`mb-4 text-center ${
              message.includes("successfully")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          <Button
            type="submit"
            className="w-[45%] bg-green-500 hover:bg-green-600 rounded-3xl"
            disabled={loading}
          >
            {loading ? <Loader className="animate-spin" /> : "Generate Lesson"}
          </Button>
          <Button
            type="button"
            className="w-[45%] bg-red-500 hover:bg-red-600 rounded-3xl"
            onClick={handleOnClear}
            disabled={loading}
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLessonForm;
