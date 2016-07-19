<?php
/**
 * Flickrizr
 *
 * Copyright (c) 2016 Junior Herval - http://www.ekto.com.br/
 * Licensed under MIT.
 * Date: 7/15/2016
 *
 * Responsive and simple Flickr gallery
 *
 * @author Junior Herval
 * @version 1.0
 */
include 'FlickrizrConfig.php';

final class Flickrizr extends FlickrizrConfig {

    var $jsonUrlParams;

    /**
     * Get Sets
     *
     * Get all available sets from the user Flickr account
     *
     * @author Junior Herval
     * @version 1.0
     *
     * @param int $perPage Number of sets per page
     * @param int $pageNo Starting page number
     *
     * @return Object
     */
    public function getSets($perPage = 25, $pageNo = 1)
    {
        $jsonUrlParams = array(
            $this->REST_URL.'?method=flickr.photosets.getList',
            'api_key='.$this->API_KEY,
            'user_id='.$this->USER_ID,
            'per_page='.$perPage,
            'page='.$pageNo,
            'format=json',
            'nojsoncallback=1',
            time()
        );

        return json_decode(file_get_contents(implode('&', $jsonUrlParams)));
    }

    /**
     * Get Photos
     *
     * Get all photos from a particular set
     *
     * @author Junior Herval
     * @version 1.0
     *
     * @param int $setId Gallery ID
     * @param int $perPage Number of photos per page
     * @param int $pageNo Starting page number
     *
     * @return Object
     */
    public function getPhotos($setId, $perPage = 500, $pageNo = 1)
    {
        $jsonUrlParams = array(
            $this->REST_URL.'?method=flickr.photosets.getPhotos',
            'api_key='.$this->API_KEY,
            'photoset_id='.$setId,
            'per_page='.$perPage,
            'page='.$pageNo,
            'media=photos',
            'extras=date_upload',
            'format=json',
            'nojsoncallback=1',
            time()
        );

        return json_decode(file_get_contents(implode('&', $jsonUrlParams)));
    }

    /**
     * Get Photoset Info
     *
     * Get details from a particular set
     *
     * @author Junior Herval
     * @version 1.0
     *
     * @param int $setId Gallery ID
     *
     * @return Object
     */
    public function getPhotosetInfo($setId)
    {
        $jsonUrlParams = array(
            $this->REST_URL.'?method=flickr.photosets.getInfo',
            'api_key='.$this->API_KEY,
            'photoset_id='.$setId,
            'format=json',
            'nojsoncallback=1',
            time()
        );

        return json_decode(file_get_contents(implode('&', $jsonUrlParams)));
    }

    /**
     * Get Photo Info
     *
     * Get details from a single photo
     *
     * @author Junior Herval
     * @version 1.0
     *
     * @param int $photoId Photo ID
     *
     * @return Object
     */
    public function getPhotoInfo($photoId)
    {
        $jsonUrlParams = array(
            $this->REST_URL.'?method=flickr.photos.getInfo',
            'api_key='.$this->API_KEY,
            'photo_id='.$photoId,
            'format=json',
            'nojsoncallback=1',
            time()
        );

        return json_decode(file_get_contents(implode('&', $jsonUrlParams)));
    }

    /**
     * Generate Url
     *
     * Generate url for galleries and photos
     *
     * @author Junior Herval
     * @version 1.0
     *
     * @param array $params Required params to form the requested URL (Type, ID, Farm, Server, Secret, Size)
     *
     * @return Object
     */
    public function generateUrl(array $params)
    {
        switch($params['type']){
            case 'set':
                return 'http://www.flickr.com/photos/'.$this->USER_ID.'/sets/'.$params['id'];
                break;
            case 'photo':
                return 'http://www.flickr.com/photos/'.$this->USER_ID.'/'.$params['id'];
                break;
            case 'image':
                return 'http://farm'.$params['farm'].'.static.flickr.com/'.$params['server'].'/'.$params['id'].'_'.$params['secret'].$params['size'].'.jpg';
                break;
            default:
                return '';
        }
    }

    /**
     * Generate Json
     *
     * Generate the json file for the Carousel
     *
     * @author Junior Herval
     * @version 1.0
     *
     * @param int $setId Gallery ID
     *
     * @return string
     */
    public function generateJson($setId) {

        $result = array();

        if(is_numeric($setId)) {

            $setInfo = $this->getPhotosetInfo($setId);

            $result['title'] = $setInfo->photoset->title->_content;
            $result['description'] = $setInfo->photoset->description->_content;
            $result['size'] = $setInfo->photoset->photos;
            $result['date_create'] = $setInfo->photoset->date_create;
            $result['photos'] = array();

            $allPhotos = $this->getPhotos($setId);

            if(!empty($allPhotos->photoset->photo)){
                foreach($allPhotos->photoset->photo as $photo) {
                    $result['photos'][] = array(
                        'url' => $this->generateUrl(
                            array(
                                'type' => 'photo',
                                'id' => $photo->id
                            )
                        ),
                        'title' => $photo->title,
                        'primary' => ($photo->isprimary == 1),
                        'dateupload' => $photo->dateupload,
                        'src' => $this->generateUrl(
                            array(
                                'type' => 'image',
                                'farm' => $photo->farm,
                                'server' => $photo->server,
                                'id' => $photo->id,
                                'secret' => $photo->secret
                            )
                        ),
                        'srcbig' => $this->generateUrl(
                            array(
                                'type' => 'image',
                                'farm' => $photo->farm,
                                'server' => $photo->server,
                                'id' => $photo->id,
                                'secret' => $photo->secret,
                                'size' => '_z'
                            )
                        ),
                        'thumb' => $this->generateUrl(
                            array(
                                'type' => 'image',
                                'farm' => $photo->farm,
                                'server' => $photo->server,
                                'id' => $photo->id,
                                'secret' => $photo->secret,
                                'size' => '_s'
                            )
                        )
                    );
                }
            }
        }

        return json_encode($result);
    }
}

