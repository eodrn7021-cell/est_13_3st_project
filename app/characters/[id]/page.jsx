import styles from "./detail.module.scss";

const CharacterDetailPage = async ({ params }) => {
  const { id } = await params;

  return <main className={styles.page}>캐릭터 상세 페이지: {id}</main>;
};

export default CharacterDetailPage;
