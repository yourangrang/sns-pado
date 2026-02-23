type Props = {
  imageUrls: string[];
};

export default function PostImages({ imageUrls }: Props) {
  if (!imageUrls || imageUrls.length === 0) return null;

  // 1장
  if (imageUrls.length === 1) {
    return (
      <div className="w-full h-52 rounded-xl overflow-hidden">
        <img
          src={imageUrls[0]}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 2장
  if (imageUrls.length === 2) {
    return (
      <div className="flex gap-1 h-52 overflow-hidden rounded-xl">
        <img
          src={imageUrls[0]}
          className="w-1/2 h-full object-cover "
        />
        <img
          src={imageUrls[1]}
          className="w-1/2 h-full object-cover"
        />
      </div>
    );
  }


  // 3장 
  if (imageUrls.length === 3) {
    return (
      <div className="flex gap-1 h-52 overflow-hidden rounded-xl">
        {/* 1번 이미지 */}
        <img
          src={imageUrls[0]}
          className="w-1/2 h-full object-cover  "
        />

        {/* 2, 3번 이미지 */}
        <div className="w-1/2 h-full flex flex-col gap-1">
          <img
            src={imageUrls[1]}
            className="w-full h-1/2 object-cover "
          />
          <img
            src={imageUrls[2]}
            className="w-full h-1/2 object-cover  "
          />
        </div>
      </div>
    );
  };

  // 4장
  if (imageUrls.length === 4) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-1 h-52 overflow-hidden rounded-xl">
        <img
          src={imageUrls[0]}
          className="w-full h-full object-cover "
        />
        <img
          src={imageUrls[1]}
          className="w-full h-full object-cover "
        />
        <img
          src={imageUrls[2]}
          className="w-full h-full object-cover "
        />
        <img
          src={imageUrls[3]}
          className="w-full h-full object-cover "
        />
      </div>
    );
  }



}





