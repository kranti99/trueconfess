import { FaThumbsUp, FaComment } from 'react-icons/fa';
import EditDropDown from './EditDropDown';

export default function ConfessionActions({ confession, onDelete, onEdit }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <FaThumbsUp className="text-white mr-2" />
        <span className="text-gray-400">{confession.likes} Likes</span>
      </div>
      <div className="flex items-center">
        <FaComment className="text-white mr-2" />
        <span className="text-gray-400">{confession.comments} Comments</span>
      </div>
      <EditDropDown
        onEdit={() => onEdit(confession)}
        onDelete={() => onDelete(confession.id)}
      />
    </div>
  );
}
