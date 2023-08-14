interface UserCardProps {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  personType: string;
}

const UserCard = ({
  id,
  name,
  username,
  imgUrl,
  personType,
}: UserCardProps) => {
  return <div>UserCard</div>;
};

export default UserCard;
