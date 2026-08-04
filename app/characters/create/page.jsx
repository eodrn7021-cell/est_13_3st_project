"use client";
import Header from "@/components/layout/Header/Header";
import CharacterForm from "@/components/character/CharacterForm/CharacterForm";

export default function CreateCharacterPage() {
  const handleSubmit = (formData) => {
    console.log("Character form submitted:", formData);
  };

  return (
    <>
      <Header variant="account" />
      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        <CharacterForm onSubmit={handleSubmit} />
      </div>
    </>
  );
}